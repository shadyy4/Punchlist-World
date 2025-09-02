// app.js

let items = JSON.parse(localStorage.getItem("punchlist")) || [];
let statusOptions = ["Pending", "Fix", "Closed"];
let currentStatusIndex = 0;
let selectedImages = [];

// Mostrar el formulario
function showForm() {
  document.getElementById("form-section").classList.remove("hidden");
  resetForm();
}

// Cancelar formulario
function cancelForm() {
  document.getElementById("form-section").classList.add("hidden");
  resetForm();
}

// Cambiar estado del ítem
function toggleStatus() {
  currentStatusIndex = (currentStatusIndex + 1) % statusOptions.length;
  document.getElementById("status-btn").innerText = statusOptions[currentStatusIndex];
}

// Manejo de imágenes
function handleImages(event) {
  const files = Array.from(event.target.files).slice(0, 4);
  selectedImages = [];

  const preview = document.getElementById("image-preview");
  preview.innerHTML = "";

  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = function (e) {
      selectedImages.push(e.target.result);
      const img = document.createElement("img");
      img.src = e.target.result;
      preview.appendChild(img);
    };
    reader.readAsDataURL(file);
  });
}

// Guardar ítem
function saveItem() {
  const item = {
    id: Date.now(),
    description: document.getElementById("description").value,
    room: document.getElementById("room").value,
    service: document.getElementById("service").value,
    priority: document.getElementById("priority").value,
    assignTo: document.getElementById("assignTo").value,
    date: document.getElementById("date").value,
    comments: document.getElementById("comments").value,
    status: statusOptions[currentStatusIndex],
    images: selectedImages
  };

  items.push(item);
  localStorage.setItem("punchlist", JSON.stringify(items));
  renderTable();
  cancelForm();
}

// Mostrar ítems en la tabla
function renderTable(filteredItems = null) {
  const tbody = document.querySelector("#items-table tbody");
  tbody.innerHTML = "";

  const data = filteredItems || items;

  data.forEach((item, index) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${item.room}</td>
      <td>${item.service}</td>
      <td>${getPriorityLabel(item.priority)}</td>
      <td>${item.assignTo}</td>
      <td><button onclick="changeStatus(${item.id})">${item.status}</button></td>
      <td>${item.description}</td>
      <td>${item.images.length} 📸</td>
      <td><button onclick="editItem(${item.id})">✏️</button></td>
    `;

    tbody.appendChild(row);
  });

  populateFilters();
}

// Cambiar estado desde la tabla
function changeStatus(id) {
  const item = items.find(i => i.id === id);
  if (item) {
    const nextIndex = (statusOptions.indexOf(item.status) + 1) % statusOptions.length;
    item.status = statusOptions[nextIndex];
    localStorage.setItem("punchlist", JSON.stringify(items));
    renderTable();
  }
}

// Obtener texto de prioridad
function getPriorityLabel(priority) {
  switch (priority) {
    case "1": return "1 - Critical (🔴)";
    case "2": return "2 - Serious (🟠)";
    case "3": return "3 - Minor (🟡)";
    case "4": return "4 - Design Issue (🔵)";
    default: return "";
  }
}

// Resetear el formulario
function resetForm() {
  document.getElementById("description").value = "";
  document.getElementById("room").value = "";
  document.getElementById("service").value = "";
  document.getElementById("priority").value = "1";
  document.getElementById("assignTo").value = "";
  document.getElementById("date").value = "";
  document.getElementById("comments").value = "";
  document.getElementById("status-btn").innerText = "Pending";
  currentStatusIndex = 0;
  selectedImages = [];
  document.getElementById("image-preview").innerHTML = "";
}

// Filtros dinámicos
function populateFilters() {
  const serviceSet = new Set(items.map(i => i.service));
  const assignSet = new Set(items.map(i => i.assignTo));

  const serviceFilter = document.getElementById("filter-service");
  const priorityFilter = document.getElementById("filter-priority");
  const assignFilter = document.getElementById("filter-assign");

  serviceFilter.innerHTML = `<option value="">Todos los servicios</option>`;
  assignFilter.innerHTML = `<option value="">Todos los asignados</option>`;
  priorityFilter.innerHTML = `
    <option value="">Todas las prioridades</option>
    <option value="1">1 - Critical</option>
    <option value="2">2 - Serious</option>
    <option value="3">3 - Minor</option>
    <option value="4">4 - Design Issue</option>
  `;

  serviceSet.forEach(service => {
    serviceFilter.innerHTML += `<option value="${service}">${service}</option>`;
  });

  assignSet.forEach(assign => {
    assignFilter.innerHTML += `<option value="${assign}">${assign}</option>`;
  });
}

// Aplicar filtros
function applyFilters() {
  const service = document.getElementById("filter-service").value;
  const priority = document.getElementById("filter-priority").value;
  const assignTo = document.getElementById("filter-assign").value;

  let filtered = items;

  if (service) filtered = filtered.filter(i => i.service === service);
  if (priority) filtered = filtered.filter(i => i.priority === priority);
  if (assignTo) filtered = filtered.filter(i => i.assignTo === assignTo);

  renderTable(filtered);
}

// Editar ítem (pendiente de implementar)
function editItem(id) {
  alert("Función de editar aún no implementada.");
}

// PDF Export (pendiente de implementar)
function generatePDF() {
  alert("Exportar PDF estará disponible en el siguiente paso.");
}

// Iniciar app
async function generatePDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  let page = 0;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    if (i > 0) doc.addPage();
    page++;

    doc.setFontSize(14);
    doc.text(`Punchlist Item #${i + 1}`, 15, 20);

    doc.setFontSize(11);
    const fields = [
      [`Descripción:`, item.description],
      [`Room:`, item.room],
      [`Service:`, item.service],
      [`Priority:`, getPriorityLabel(item.priority)],
      [`Assign To:`, item.assignTo],
      [`Date:`, item.date],
      [`Status:`, item.status],
      [`Comments:`, item.comments],
    ];

    let y = 30;
    fields.forEach(([label, value]) => {
      doc.text(`${label} ${value}`, 15, y);
      y += 8;
    });

    // Añadir imágenes (si hay)
    if (item.images && item.images.length > 0) {
      y += 4;
      doc.setFontSize(12);
      doc.text("Fotos:", 15, y);
      y += 4;

      const imgWidth = 60;
      const imgHeight = 45;
      let x = 15;

      for (let j = 0; j < item.images.length; j++) {
        if (j > 0 && j % 3 === 0) {
          y += imgHeight + 5;
          x = 15;
        }
        doc.addImage(item.images[j], 'JPEG', x, y, imgWidth, imgHeight);
        x += imgWidth + 5;
      }
    }
  }

  doc.save(`Punchlist_Report_Page${page}.pdf`);
}

renderTable();
