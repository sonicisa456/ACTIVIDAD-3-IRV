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
    botonAgregar.style.display = "none";
    btnEditar.style.display = "none";
    btnEliminar.style.display = "none";
    asignadoAInput.style.display = "none";
    fechaLimiteInput.style.display = "none";

    // Todos pueden cambiar estado
    btnEstado.style.display = "inline-block";

    // 🔓 Solo admin
    if (rol === "admin") {
        botonAgregar.style.display = "inline-block";
        btnEditar.style.display = "inline-block";
        btnEliminar.style.display = "inline-block";
        asignadoAInput.style.display = "inline-block";
        fechaLimiteInput.style.display = "inline-block";
    }

    let tareas = [];
    let tareaSeleccionada = null;

    async function cargarTareas() {
        const res = await fetch("http://localhost:3000/tareas", {
            headers: { Authorization: "Bearer " + token }
        });

        const data = await res.json();

        // Usuarios normales solo ven sus tareas
        tareas = rol === "admin"
            ? data
            : data.filter(t => t.asignadoA === usuario);

        actualizarVista();
    }

    function actualizarVista() {
        listaTareas.innerHTML = "";
        tareaSeleccionada = null;

        tareas.forEach(t => {
            const li = document.createElement("li");
            li.innerHTML = `
                <strong>${t.nombre}</strong><br>
                Estado: ${t.estado}<br>
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
    botonAgregar.onclick = async () => {
        const nombre = tareaInput.value.trim();
        const asignadoA = asignadoAInput.value;
        const fechaLimite = fechaLimiteInput.value;

        if (!nombre || !asignadoA) return alert("Faltan datos");

        await fetch("http://localhost:3000/tareas", {
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

    // 🔴 Eliminar (solo admin)
    btnEliminar.onclick = async () => {
        if (!tareaSeleccionada) return alert("Selecciona una tarea");

        await fetch(`http://localhost:3000/tareas/${tareaSeleccionada.id}`, {
            method: "DELETE",
            headers: { Authorization: "Bearer " + token }
        });

        cargarTareas();
    };

    // 🟡 Editar (solo admin)
    btnEditar.onclick = async () => {
        if (!tareaSeleccionada) return alert("Selecciona una tarea");

        const nuevo = prompt("Nuevo nombre:", tareaSeleccionada.nombre);
        if (!nuevo) return;

        await fetch(`http://localhost:3000/tareas/${tareaSeleccionada.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token
            },
            body: JSON.stringify({ nombre: nuevo })
        });

        cargarTareas();
    };

    // 🔵 Cambiar estado (TODOS)
    btnEstado.onclick = async () => {
        if (!tareaSeleccionada) return alert("Selecciona una tarea");

        const nuevoEstado = tareaSeleccionada.estado === "Pendiente" ? "Completado" : "Pendiente";

        await fetch(`http://localhost:3000/tareas/${tareaSeleccionada.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token
            },
            body: JSON.stringify({ estado: nuevoEstado })
        });

        cargarTareas();
    };

    cargarTareas();
});
