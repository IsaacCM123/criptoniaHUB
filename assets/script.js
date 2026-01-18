/* +++++++++++++++++++++ Ventana Modal +++++++++++++++++++++ */
const user=localStorage.getItem('user')/*localStorage devuelve el nombre del usuario ala variable user*/
const ventanaModal=document.getElementById('modal')
if(!user){/*Si el usuario es diferente a true (Ocea falso o vacio. NO ESTA REGISTRADO)*/
  const contenidoModal=document.createElement('div')/*Creamos un elemento DIV dentro de ventanaModal*/
  contenidoModal.classList.add('modal-content')/*Agregamos una clase modal-content*/
  contenidoModal.innerHTML=`
    <h2 id="bienvenido">Bienvenido</h2>
    <input type="text" id="usernameInput" placeholder="Tu nombre">
    <button id="guardarUSR"onclick="saveUser()">Participar</button>
    <p id="error"></p>
  `;
  ventanaModal.appendChild(contenidoModal)/*contenidoModal es hijo de ventanaModal*/
  /*Validar el campo de texto nombre desde el teclado (usernameInput)*/
  const campoTextoNombre=document.getElementById('usernameInput')
  const error=document.getElementById('error')

  campoTextoNombre.addEventListener('input',function(){
    const valor=this.value
    /*Expresión regular: solo letras (mayúsculas y minúsculas)*/
    const soloLetras=/^[a-zA-Z]*$/
    if(!soloLetras.test(valor)){
      error.textContent='❌ Solo se permiten letras'
      /*Elimina el ultimo caracter invalido*/
      this.value=valor.slice(0,-1)
    }else{
      error.textContent=''
    }
  })
  function saveUser(){/*En el boton (participar) estara la funcion saveUser pero primero validamos*/
    if(campoTextoNombre.value.length<4){
      error.textContent='❌ Debe tener al menos 4 letras'
      campoTextoNombre.focus()
    }else{
      const name=campoTextoNombre.value
      localStorage.setItem('user',name)
      location.reload()
    }
  }
  /* Si no esta registrado con su nombre bloquear COMENTARIOS */
  document.getElementById('userLabel').disabled = true
  document.getElementById('commentInput').disabled = true
  document.getElementById('agregarNombre').disabled = true
}else{/*Caso contrario si el usuario es true (Ocea verdadero. ESTA REGISTRADO)*/
  ventanaModal.remove()/*Quitamos el modal de registro*/
  document.getElementById('userLabel').innerText=`Usuario: ${user}`/*Mostramos el nombre del usuario*/  
}

const areaTexto=document.getElementById('commentInput')/*Validamos el campo <textarea> si esta foco limpiar*/
areaTexto.addEventListener('focus',function(){
  areaTexto.value=''
})

const socket = io()

async function loadComments() {
  const res = await fetch('/comments')
  const data = await res.json()
  renderComments(data)
}

function renderComments(comments) {
  const container = document.getElementById('comments')
  container.innerHTML = ''

  comments.forEach(c => {
    container.innerHTML += `
      <div>
        <b>${c.user}</b>
        <p>${c.text}</p>
        <button onclick="like('${c._id}')">👍 ${c.likes.length}</button>
        <button onclick="dislike('${c._id}')">👎 ${c.dislikes.length}</button>
      </div>
    `
  })
}

async function addComment(){
  const longitud=areaTexto.value/*Validando espacios en blanco*/
  const valorSinEspacios=longitud.trim()/*Validando espacios en blanco*/
  if(areaTexto.value.length<2||areaTexto.value=='Comenta...'||valorSinEspacios===''){/*Poco de validacion*/
    areaTexto.focus()
    areaTexto.innerHTML = ''
  }else{
    const text = commentInput.value
    await fetch('/comments', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ user, text })
    })
    commentInput.value = ''
    areaTexto.focus()
  }
}

async function like(id) {
  await fetch(`/like/${id}`, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ user })
  })
}

async function dislike(id) {
  await fetch(`/dislike/${id}`, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ user })
  })
}
socket.on('new-comment', loadComments)
socket.on('update-comment', loadComments)
loadComments()