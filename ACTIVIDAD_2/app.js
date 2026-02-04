
document.addEventListener('DOMContentLoaded', () => { // esto asegura que el DOM esté cargado
    const tareaInput = document.getElementById('Nueva-Tarea');
    const botonAgregar = document.getElementById('agregar-tarea');
    const listaTareas = document.getElementById('lista-tareas');

    let tareas = JSON.parse(localStorage.getItem('misTareas')) || []; // carga las tareas que ya existen

    tareas.forEach(tarea => crearElementoTarea(tarea)); // por cada tarea existente, crea un elemento en la lista

    botonAgregar.addEventListener('click', () => {
        const texto = tareaInput.value.trim(); //trim para eliminar espacios en blanco
        if (texto === '') return; // no agregar tareas vacías

        const nuevaTarea = { // crea un objeto tarea
            texto: texto,
            hecha: false
        };

        tareas.push(nuevaTarea); // agrega la nueva tarea al array
        guardar();
        crearElementoTarea(nuevaTarea);
        tareaInput.value = '';
    });

    function crearElementoTarea(tarea) {// funcion para crear el elemento de la tarea en el DOM
        const li = document.createElement('li');

        const spanTexto = document.createElement('span');// elemento para el texto de la tarea
        spanTexto.textContent = tarea.texto;// asigna el texto de la tarea
        if (tarea.hecha) spanTexto.style.textDecoration = 'line-through';// si la tarea está hecha, la tacha

        const divBotones = document.createElement('div'); // contenedor para los botones

        const btnListo = document.createElement('button');// botón para marcar como hecha
        btnListo.textContent = 'Listo';
        btnListo.onclick = () => {
            tarea.hecha = !tarea.hecha; //si le haces click al boton cambia el estado de hecha a no hecha y viceversa
            spanTexto.style.textDecoration =// si la tarea está hecha, la tacha
                tarea.hecha ? 'line-through' : 'none';
            guardar(); // guarda el estado actualizado en localStorage
        };

        const btnEditar = document.createElement('button'); // botón para editar la tarea
        btnEditar.textContent = 'Editar';
        btnEditar.classList.add('edit-btn'); // esto agrega una clase al botón de editar
        btnEditar.onclick = () => {
            const nuevoTexto = prompt("Editar tarea:", tarea.texto);
            if (nuevoTexto && nuevoTexto.trim() !== '') {   
                tarea.texto = nuevoTexto.trim();
                spanTexto.textContent = tarea.texto;
                guardar();
            }
        };

        const btnEliminar = document.createElement('button'); // botón para eliminar la tarea
        btnEliminar.textContent = 'Eliminar';
        btnEliminar.classList.add('delete-btn'); //
        btnEliminar.onclick = () => {
            tareas = tareas.filter(t => t !== tarea);
            guardar();
            li.remove();
        };

        divBotones.appendChild(btnListo); // agrega los botones al contenedor
        divBotones.appendChild(btnEditar); 
        divBotones.appendChild(btnEliminar);

        li.appendChild(spanTexto);
        li.appendChild(divBotones);
        listaTareas.appendChild(li);
    }

    function guardar() {
        localStorage.setItem('misTareas', JSON.stringify(tareas));
    }
});
