document.addEventListener('DOMContentLoaded', () => {
    const tareaInput = document.getElementById('Nueva-Tarea');
    const botonAgregar = document.getElementById('agregar-tarea');
    const listaTareas = document.getElementById('lista-tareas');
    const btnEditar = document.getElementById('btn-editar');
    const btnEliminar = document.getElementById('btn-eliminar');

    let tareas = JSON.parse(localStorage.getItem('misTareas')) || [];
    let tareaSeleccionada = null;

    function actualizarVista() {
        listaTareas.innerHTML = '';
        
        // Mostrar/Ocultar botones de Editar y Eliminar
        const displayStatus = tareas.length > 0 ? 'block' : 'none';
        btnEditar.style.display = displayStatus;
        btnEliminar.style.display = displayStatus;

        tareas.forEach(tarea => {
            const li = document.createElement('li');
            li.textContent = `• ${tarea.texto}`;
            
            li.onclick = () => {
                document.querySelectorAll('#lista-tareas li').forEach(el => el.classList.remove('selected'));
                li.classList.add('selected');
                tareaSeleccionada = tarea;
            };

            listaTareas.appendChild(li);
        });
    }

    botonAgregar.onclick = () => {
        const texto = tareaInput.value.trim();
        if (!texto) return;

        tareas.push({ texto, id: Date.now() });
        localStorage.setItem('misTareas', JSON.stringify(tareas));
        tareaInput.value = '';
        actualizarVista();
    };

    btnEliminar.onclick = () => {
        if (!tareaSeleccionada) return alert("Selecciona una tarea de la lista");
        tareas = tareas.filter(t => t.id !== tareaSeleccionada.id);
        tareaSeleccionada = null;
        localStorage.setItem('misTareas', JSON.stringify(tareas));
        actualizarVista();
    };

    btnEditar.onclick = () => {
        if (!tareaSeleccionada) return alert("Selecciona una tarea de la lista");
        const nuevo = prompt("Editar:", tareaSeleccionada.texto);
        if (nuevo) {
            tareaSeleccionada.texto = nuevo;
            localStorage.setItem('misTareas', JSON.stringify(tareas));
            actualizarVista();
        }
    };

    actualizarVista();
});
