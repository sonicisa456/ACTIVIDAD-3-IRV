document.addEventListener("DOMContentLoaded", async () => {
    const tareaInput = document.getElementById("Nueva-Tarea");
    const botonAgregar = document.getElementById("agregar-tarea");
    const listaTareas = document.getElementById("lista-tareas");
    const btnEditar = document.getElementById("btn-editar");
    const btnEliminar = document.getElementById("btn-eliminar");
    const btnEstado = document.getElementById("btn-estado");
    const asignadoAInput = document.getElementById("asignado-a");
    const fechaLimiteInput = document.getElementById("fecha-limite");

    const token = localStorage.getItem("token");

    if (!token) {
        alert("No has iniciado sesión");
        window.location.href = "enlaceweb.html";
        return;
    }

    let rol = "user";
    let usuario = "";

    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        rol = payload.role;
        usuario = payload.username;
    } catch (e) {
        alert("Sesión inválida");
        window.location.href = "enlaceweb.html";
        return;
    }

    // 🔒 Bloqueo por defecto
    if (botonAgregar) botonAgregar.style.display = "none";
    if (btnEditar) btnEditar.style.display = "none";
    if (btnEliminar) btnEliminar.style.display = "none";
    if (asignadoAInput) asignadoAInput.style.display = "none";
    if (fechaLimiteInput) fechaLimiteInput.style.display = "none";

    // Todos pueden cambiar estado
    if (btnEstado) btnEstado.style.display = "inline-block";

    // 🔓 Solo admin
    if (rol === "admin") {
        if (botonAgregar) botonAgregar.style.display = "inline-block";
        if (btnEditar) btnEditar.style.display = "inline-block";
        if (btnEliminar) btnEliminar.style.display = "inline-block";
        if (asignadoAInput) asignadoAInput.style.display = "inline-block";
        if (fechaLimiteInput) fechaLimiteInput.style.display = "inline-block";
    }

    let tareas = [];
    let tareaSeleccionada = null;

    async function cargarTareas() {
        const res = await fetch("/tareas", {
            headers: { Authorization: "Bearer " + token }
        });

        const data = await res.json();

        // Usuarios normales solo ven sus tareas
        tareas = rol === "admin" ? data : data.filter(t => t.asignadoA === usuario);

        actualizarVista();
    }

    function actualizarVista() {
        listaTareas.innerHTML = "";
        tareaSeleccionada = null;

        tareas.forEach(t => {
            const li = document.createElement("li");
            li.innerHTML = `
                <strong>${t.nombre}</strong><br>
                Estado: ${t.estatus}<br>
                Creado por: ${t.creadoPor}<br>
                Asignado a: ${t.asignadoA}<br>
                Fecha: ${new Date(t.fechaCreacion).toLocaleDateString()}<br>
                Límite: ${t.fechaLimite || "No definida"}
            `;

            li.onclick = () => {
                document.querySelectorAll("#lista-tareas li").forEach(el => el.classList.remove("selected"));
                li.classList.add("selected");
                tareaSeleccionada = t;
            };

            listaTareas.appendChild(li);
        });
    }

    // 🟢 Crear tarea (solo admin)
    if (botonAgregar) {
        botonAgregar.onclick = async () => {
            const nombre = tareaInput.value.trim();
            const asignadoA = asignadoAInput.value;
            const fechaLimite = fechaLimiteInput.value;

            if (!nombre || !asignadoA) return alert("Faltan datos");

            await fetch("/tareas", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + token
                },
                body: JSON.stringify({ nombre, asignadoA, fechaLimite })
            });

            tareaInput.value = "";
            cargarTareas();
        };
    }

    // 🔴 Eliminar (solo admin)
    if (btnEliminar) {
        btnEliminar.onclick = async () => {
            if (!tareaSeleccionada) return alert("Selecciona una tarea");

            await fetch(`/tareas/${tareaSeleccionada.id}`, {
                method: "DELETE",
                headers: { Authorization: "Bearer " + token }
            });

            cargarTareas();
        };
    }

    // 🟡 Editar (solo admin)
    if (btnEditar) {
        btnEditar.onclick = async () => {
            if (!tareaSeleccionada) return alert("Selecciona una tarea");

            const nuevo = prompt("Nuevo nombre:", tareaSeleccionada.nombre);
            if (!nuevo) return;

            await fetch(`/tareas/${tareaSeleccionada.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + token
                },
                body: JSON.stringify({ nombre: nuevo })
            });

            cargarTareas();
        };
    }

    // 🔵 Cambiar estado (TODOS)
    if (btnEstado) {
        btnEstado.onclick = async () => {
            if (!tareaSeleccionada) return alert("Selecciona una tarea");

            const nuevoEstado = tareaSeleccionada.estatus === "pendiente" ? "completado" : "pendiente";

            await fetch(`/tareas/${tareaSeleccionada.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + token
                },
                body: JSON.stringify({ estatus: nuevoEstado })
            });

            cargarTareas();
        };
    }

    cargarTareas();
});
