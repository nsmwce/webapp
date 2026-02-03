// State
let currentCollection = 'coordinators';
let currentData = [];
let editingItemId = null;

// Collection schemas
const SCHEMAS = {
    coordinators: [
        { name: 'name', type: 'text', label: 'Name', required: true },
        { name: 'designation', type: 'text', label: 'Designation', required: true },
        { name: 'email', type: 'email', label: 'Email', required: true },
        { name: 'url', type: 'url', label: 'URL', required: true },
        { name: 'photo', type: 'image', label: 'Photo', required: true }
    ],
    events: [
        { name: 'title', type: 'text', label: 'Title', required: true },
        { name: 'month', type: 'text', label: 'Month', required: true },
        { name: 'year', type: 'text', label: 'Year', required: true },
        { name: 'location', type: 'text', label: 'Location', required: true },
        { name: 'participants', type: 'number', label: 'Participants', required: true },
        { name: 'summary', type: 'textarea', label: 'Summary', required: true }
    ],
    eventphotos: [
        { name: 'caption', type: 'text', label: 'Caption', required: true },
        { name: 'image', type: 'image', label: 'Image', required: true }
    ],
    importantlinks: [
        { name: 'title', type: 'text', label: 'Title', required: true },
        { name: 'url', type: 'url', label: 'URL', required: true }
    ],
    materials: [
        { name: 'title', type: 'text', label: 'Title', required: true },
        { name: 'topic', type: 'select', label: 'Topic', required: true, options: ['openmp', 'mpi', 'cuda', 'ai'] },
        { name: 'url', type: 'url', label: 'URL', required: true }
    ],
    sisternodals: [
        { name: 'name', type: 'text', label: 'Name', required: true },
        { name: 'url', type: 'url', label: 'URL', required: true },
        { name: 'photo', type: 'image', label: 'Photo', required: true }
    ]
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    loadCollection('coordinators');
});

function setupEventListeners() {
    // Tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentCollection = e.target.dataset.collection;
            loadCollection(currentCollection);
        });
    });

    // Add button
    document.getElementById('addBtn').addEventListener('click', () => showAddModal());

    // Search
    document.getElementById('searchInput').addEventListener('input', (e) => {
        filterData(e.target.value);
    });

    // Modal close
    document.querySelector('.close').addEventListener('click', () => closeModal());
    document.getElementById('cancelBtn').addEventListener('click', () => closeModal());

    // Form submit
    document.getElementById('itemForm').addEventListener('submit', (e) => {
        e.preventDefault();
        saveItem();
    });

    // Delete modal
    document.getElementById('cancelDeleteBtn').addEventListener('click', () => {
        document.getElementById('deleteModal').classList.remove('show');
    });

    // Build button
    document.getElementById('buildBtn').addEventListener('click', () => triggerBuild());
    
    // Purge CDN button
    document.getElementById('purgeCdnBtn').addEventListener('click', () => purgeCdnCache());
}

async function loadCollection(collection) {
    try {
        document.getElementById('loading').style.display = 'block';
        document.getElementById('tableContainer').innerHTML = '';
        
        const response = await fetch(`/api/data/${collection}`);
        const data = await response.json();
        currentData = data;
        
        document.getElementById('loading').style.display = 'none';
        renderTable(data);
    } catch (error) {
        console.error('Error loading collection:', error);
        alert('Error loading data: ' + error.message);
    }
}

function renderTable(data) {
    const schema = SCHEMAS[currentCollection];
    const container = document.getElementById('tableContainer');
    
    if (!data || data.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 40px; color: #666;">No items found. Click "Add New" to create one.</p>';
        return;
    }

    let html = '<table><thead><tr>';
    
    // Headers
    schema.forEach(field => {
        if (field.type !== 'image' || (field.name !== 'data' && field.name !== 'photo')) {
            html += `<th>${field.label}</th>`;
        } else {
            html += `<th>Preview</th>`;
        }
    });
    html += '<th>Actions</th></tr></thead><tbody>';
    
    // Rows
    data.forEach(item => {
        html += '<tr>';
        schema.forEach(field => {
            if (field.type === 'image') {
                const imgData = getImageData(item, field.name);
                if (imgData) {
                    html += `<td class="image-cell"><img src="${imgData}" alt="Preview"></td>`;
                } else {
                    html += '<td>No image</td>';
                }
            } else {
                html += `<td>${item[field.name] || ''}</td>`;
            }
        });
        html += `
            <td class="action-btns">
                <button class="btn btn-primary btn-sm" onclick="showEditModal('${item._id.$oid}')">Edit</button>
                <button class="btn btn-danger btn-sm" onclick="deleteItem('${item._id.$oid}')">Delete</button>
            </td>
        </tr>`;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

function getImageData(item, fieldName) {
    // After migration, images are stored as filenames
    if (fieldName === 'photo' && item.photo) {
        if (typeof item.photo === 'string') {
            return `/images/${item.photo}`;
        }
        // Fallback for old base64 format (pre-migration)
        const base64 = item.photo.data?.$binary?.base64;
        if (base64) {
            return `data:image/jpeg;base64,${base64}`;
        }
    }
    if (fieldName === 'image' && item.image) {
        if (typeof item.image === 'string') {
            return `/images/${item.image}`;
        }
    }
    // Old 'data' field for eventphotos (pre-migration)
    if (fieldName === 'data' && item.data) {
        const base64 = item.data.$binary?.base64;
        const contentType = item.contentType || 'image/jpeg';
        if (base64) {
            return `data:${contentType};base64,${base64}`;
        }
    }
    return null;
}

function showAddModal() {
    editingItemId = null;
    document.getElementById('modalTitle').textContent = `Add New ${currentCollection.slice(0, -1)}`;
    generateForm();
    document.getElementById('modal').classList.add('show');
}

function showEditModal(id) {
    editingItemId = id;
    const item = currentData.find(i => i._id.$oid === id);
    if (!item) return;
    
    document.getElementById('modalTitle').textContent = `Edit ${currentCollection.slice(0, -1)}`;
    generateForm(item);
    document.getElementById('modal').classList.add('show');
}

function generateForm(item = null) {
    const schema = SCHEMAS[currentCollection];
    const container = document.getElementById('formFields');
    container.innerHTML = '';
    
    schema.forEach(field => {
        const group = document.createElement('div');
        group.className = 'form-group';
        
        const label = document.createElement('label');
        label.textContent = field.label;
        if (field.required) label.textContent += ' *';
        group.appendChild(label);
        
        let input;
        if (field.type === 'textarea') {
            input = document.createElement('textarea');
            input.value = item ? (item[field.name] || '') : '';
        } else if (field.type === 'select') {
            input = document.createElement('select');
            field.options.forEach(opt => {
                const option = document.createElement('option');
                option.value = opt;
                option.textContent = opt.toUpperCase();
                if (item && item[field.name] === opt) option.selected = true;
                input.appendChild(option);
            });
        } else if (field.type === 'image') {
            input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.addEventListener('change', (e) => handleImagePreview(e, field.name));
            
            // Add note about existing image
            if (item && (item[field.name])) {
                const note = document.createElement('p');
                note.style.fontSize = '12px';
                note.style.color = '#666';
                note.style.marginBottom = '5px';
                const filename = typeof item[field.name] === 'string' ? item[field.name] : 'existing image';
                note.textContent = `Current: ${filename} (leave empty to keep)`;
                group.appendChild(note);
            }
            
            const preview = document.createElement('img');
            preview.className = 'image-preview';
            preview.id = `preview-${field.name}`;
            
            if (item) {
                const imgData = getImageData(item, field.name);
                if (imgData) {
                    preview.src = imgData;
                    preview.classList.add('show');
                }
            }
            
            group.appendChild(preview);
        } else {
            input = document.createElement('input');
            input.type = field.type;
            input.value = item ? (item[field.name] || '') : '';
        }
        
        input.name = field.name;
        if (field.type !== 'image') {
            input.required = field.required;
        }
        input.id = `input-${field.name}`;
        group.appendChild(input);
        container.appendChild(group);
    });
}

function handleImagePreview(event, fieldName) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const preview = document.getElementById(`preview-${fieldName}`);
            if (preview) {
                preview.src = e.target.result;
                preview.classList.add('show');
            }
        };
        reader.readAsDataURL(file);
    }
}

async function saveItem() {
    const schema = SCHEMAS[currentCollection];
    const formData = {};
    
    for (const field of schema) {
        const input = document.getElementById(`input-${field.name}`);
        
        if (field.type === 'image') {
            const file = input.files[0];
            if (file) {
                // Upload file and get filename
                const uploadFormData = new FormData();
                uploadFormData.append('image', file);
                uploadFormData.append('collection', currentCollection);
                
                const uploadResponse = await fetch('/api/upload-image', {
                    method: 'POST',
                    body: uploadFormData
                });
                
                const uploadResult = await uploadResponse.json();
                formData[field.name] = uploadResult.filename;
            } else if (editingItemId) {
                // Keep existing filename
                const item = currentData.find(i => i._id.$oid === editingItemId);
                if (item) {
                    formData[field.name] = item[field.name];
                }
            }
        } else {
            formData[field.name] = input.value;
        }
    }
    
    try {
        let response;
        if (editingItemId) {
            response = await fetch(`/api/data/${currentCollection}/${editingItemId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
        } else {
            response = await fetch(`/api/data/${currentCollection}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
        }
        
        if (response.ok) {
            closeModal();
            loadCollection(currentCollection);
        } else {
            const error = await response.json();
            alert('Error saving: ' + error.error);
        }
    } catch (error) {
        console.error('Error saving item:', error);
        alert('Error saving item: ' + error.message);
    }
}

function deleteItem(id) {
    editingItemId = id;
    document.getElementById('deleteModal').classList.add('show');
    
    document.getElementById('confirmDeleteBtn').onclick = async () => {
        try {
            const response = await fetch(`/api/data/${currentCollection}/${id}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                document.getElementById('deleteModal').classList.remove('show');
                loadCollection(currentCollection);
            } else {
                const error = await response.json();
                alert('Error deleting: ' + error.error);
            }
        } catch (error) {
            console.error('Error deleting item:', error);
            alert('Error deleting item: ' + error.message);
        }
    };
}

function closeModal() {
    document.getElementById('modal').classList.remove('show');
    document.getElementById('itemForm').reset();
    editingItemId = null;
}

function filterData(searchTerm) {
    if (!searchTerm) {
        renderTable(currentData);
        return;
    }
    
    const filtered = currentData.filter(item => {
        return Object.values(item).some(value => {
            if (typeof value === 'string') {
                return value.toLowerCase().includes(searchTerm.toLowerCase());
            }
            return false;
        });
    });
    
    renderTable(filtered);
}

async function triggerBuild() {
    const modal = document.getElementById('buildModal');
    const status = document.getElementById('buildStatus');
    
    modal.classList.add('show');
    status.innerHTML = '<p>Building... Please wait.</p><div class="spinner"></div>';
    
    try {
        const response = await fetch('/api/build', {
            method: 'POST'
        });
        
        const result = await response.json();
        
        if (response.ok) {
            status.innerHTML = `
                <p class="success-message">Build completed successfully!</p>
                <h3 style="margin-top: 20px;">Next Steps:</h3>
                <ol style="text-align: left; max-width: 500px; margin: 20px auto;">
                    <li>Open terminal and navigate to project</li>
                    <li>Run: <code style="background: #f0f0f0; padding: 2px 6px; border-radius: 3px;">cd build</code></li>
                    <li>Run: <code style="background: #f0f0f0; padding: 2px 6px; border-radius: 3px;">git add .</code></li>
                    <li>Run: <code style="background: #f0f0f0; padding: 2px 6px; border-radius: 3px;">git commit -m "Update build"</code></li>
                    <li>Run: <code style="background: #f0f0f0; padding: 2px 6px; border-radius: 3px;">git push origin main</code></li>
                    <li>Wait 2-3 minutes for jsDelivr CDN</li>
                    <li>Upload <strong>build/index.html</strong> to FTP</li>
                    <li>Only purge CDN cache if necessary!</li>
                </ol>
                <button onclick="document.getElementById('buildModal').classList.remove('show')" class="btn btn-primary" style="margin-top: 20px;">Close</button>
            `;
        } else {
            status.innerHTML = `<p class="error-message">Build failed!</p><p>${result.error}</p>`;
            setTimeout(() => {
                modal.classList.remove('show');
            }, 5000);
        }
    } catch (error) {
        status.innerHTML = `<p class="error-message">Build failed!</p><p>${error.message}</p>`;
        setTimeout(() => {
            modal.classList.remove('show');
        }, 5000);
    }
}

async function purgeCdnCache() {
    // Multiple confirmations to add significant friction
    const confirm1 = confirm(
        '⚠️ CDN CACHE PURGE ⚠️\n\n' +
        'This should ONLY be done after:\n' +
        '1. Building the site\n' +
        '2. Pushing to GitHub (git push origin main)\n' +
        '3. Waiting 2-3 minutes\n' +
        '4. Verifying the site still has issues\n\n' +
        'Unnecessary purges waste CDN resources.\n\n' +
        'Have you completed ALL the steps above?'
    );
    
    if (!confirm1) {
        return;
    }
    
    const confirm2 = prompt(
        'Type "PURGE CDN" (all caps) to confirm cache invalidation:'
    );
    
    if (confirm2 !== 'PURGE CDN') {
        alert('Cancelled. Cache was NOT purged.');
        return;
    }
    
    const confirm3 = confirm(
        'Final confirmation:\n\n' +
        'You are about to purge the CDN cache for:\n' +
        'https://cdn.jsdelivr.net/gh/nsmwce/webapp@main\n\n' +
        'This may take 5-10 minutes to propagate.\n\n' +
        'Are you absolutely sure?'
    );
    
    if (!confirm3) {
        alert('Cancelled. Cache was NOT purged.');
        return;
    }
    
    try {
        // Note: jsDelivr purge endpoint
        const purgeUrl = 'https://purge.jsdelivr.net/gh/nsmwce/webapp@main';
        
        const response = await fetch(purgeUrl, {
            method: 'POST'
        });
        
        if (response.ok || response.status === 200) {
            alert(
                '✅ CDN cache purge initiated!\n\n' +
                'Status: Purge request sent successfully\n\n' +
                'Timeline:\n' +
                '- Wait 5-10 minutes for full propagation\n' +
                '- Test your site after waiting\n' +
                '- Clear browser cache if needed\n\n' +
                'Monitor status at:\n' +
                'https://www.jsdelivr.com/tools/purge'
            );
        } else {
            throw new Error('Purge request failed');
        }
    } catch (error) {
        alert(
            '❌ Automatic purge failed!\n\n' +
            'Please purge manually at:\n' +
            'https://www.jsdelivr.com/tools/purge\n\n' +
            'Enter this URL:\n' +
            'https://cdn.jsdelivr.net/gh/nsmwce/webapp@main\n\n' +
            'Error: ' + error.message
        );
    }
}

// Make functions globally accessible for onclick handlers
window.showEditModal = showEditModal;
window.deleteItem = deleteItem;
