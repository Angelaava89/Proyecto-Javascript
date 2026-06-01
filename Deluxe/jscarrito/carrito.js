/* Explicación de cada concepto, comando, función y método:

let --> Variable que se puede cambiar
const --> Variable que no se puede cambiar
querySelectorAll --> Método que busca todos los elementos HTML que tengan esa clase
forEach --> Método que recorre cada elemento de una lista
forEach(item, index) -> Método que recorre cada elemento de una lista y su indice, clave para eliminar productos
addEventListener --> Método que detecta eventos, ejemplo un click
e.target --> Elemento que se clickeo
e.target.closest(.clase) --> Busca el elemento más cercano que tenga esa clase, sirve por ejemplo para asegurarse que el click fue en "Comprar"
.textContent --> Extrae solo el texto visible 
.textContent.slice(1) --> Elimina el primer caracter. Por ejemplo, de $25990 a 25990
.find() --> Método que busca un elemento en una lista, devuelve el primer elemento que cumpla la condición
.push() --> Agrega un elemento al  final de una lista
.innerHTML --> Permite modificar el contenido HTML de un elemento
.createElement() --> Crea un nuevo elemento HTML definiendo su etiqueta (por ejemplo, div, p, li, etc.)
.classList.add() --> Agrega una clase a un elemento HTML
.appendChild --> Agrega un elemento como hijo de otro elemento
span --> Etiqueta para texto en línea, se usa para aplicar estilos a partes específicas del texto
target.value --> Obwtiene el valor de un input
classList.contains() --> Verifica si un elemento tiene una clase específica
getAtribute() --> Obtiene el valor de un atributo de un elemento HTML mediante su nombre
splice --> Elimina elementos de una lista
reduce --> Recorre el array y va sumando valores 
*/
'use strict' // Modo estricto 

let contenedorCarrito=[] // Variable del carrito 

const tarjetaProducto = document.querySelectorAll(".tarjeta") //llamar a la clase de cada producto como un nodo iterable (). LLama a todos los elementos con la clase tarjeta , en nuestro caso, los productos

// Obtener la info de los productos 
tarjetaProducto.forEach(tarjeta => { // Recorre cada tarjeta (producto)
    tarjeta.addEventListener("click", e=>{ // Crea el evento click y muestra cada parte que se seleccione sea img, titulo o boton
    if(e.target.closest(".boton")){ // Verifica que el click provenga del botón de compra 
        const infoProducto={ // Objeto con la info del producto 
            Imagen:tarjeta.querySelector("img").src,
            Cantidad:1,
            Nombre:tarjeta.querySelector(".nombre").textContent,
            Precio: parseFloat(tarjeta.querySelector(".precio").textContent.slice(1)) //Slice recorre el $ y lo borra dejando solo el numero, para que despues se vayan sumando los precios  
        }
//Busca su el producto ya existe en el carrito     
        const ProductoExistente= contenedorCarrito.find(producto => infoProducto.Nombre === producto.Nombre)// busca si el producto seleccionado es el mismo que el encontrado en el carrito
        if(ProductoExistente){
            ProductoExistente.Cantidad++ // Si existe, aumenta la cantidad
        }else{
            contenedorCarrito.push(infoProducto)//Agregamos el item a la lista 
        }
        actualizarCarrito()               
    }          
    })
})

//const objetivo = e.target.closest(".boton")//  selecciono que solo sea el boton el que haga click o el que este mas cerca 
//const titulo= tarjeta.querySelector(".nombre").textContent //Desde la clase nombre extraigo solo el texto 

const ListadoCarrito= document.querySelector(".listado_carrito")
function actualizarCarrito(){
    ListadoCarrito.innerHTML="" //cada vez que se actualice se va limpiar el carrito
    contenedorCarrito.forEach((item,index)=>{//recorre cada elemento contenido en ese array, index es para poder eliminarlos
    const li= document.createElement("li") //Se crea unaa etiqueta li con los items que se van agregar 
    li.classList.add("info_carrito")
    //Inserta contenido
    li.innerHTML=`<div class="foto_carrito"> 
                        <img src="${item.Imagen}" alt="imagen">
                    </div>
                    <div class="titulo_carrito">
                        <span class="articulo">${item.Nombre}</span>
                        <div class="precio_cantidad">
                            <span class="precio"> $ ${item.Precio}</span>
                            <input type="number" class="cantidad" min="1" value="${item.Cantidad}"><!--El numero contenido parte en el 2-->
                        </div>
                    </div>
                    <div class="quitar_articulo">
                        <img src="img/quitar.png"  class= "quitar" alt="" data-index="${index}">
                    </div>

    `
    ListadoCarrito.appendChild(li) //Agregar al DOM 
    })
    ActualizarTotalCompra()
    ContadorDeArticulos()
    CantidadNumber()
    EliminarArticuloCarrito()
}

function ActualizarTotalCompra(){
   const TotalDeCompra =document.querySelector(".total_carrito")
   const Total =contenedorCarrito.reduce((acumulador,item)=> acumulador + item.Precio*item.Cantidad, 0)//este metodo es una especie de contador y al final un 0 para que no queden espacios (o valor inicial)
    TotalDeCompra.innerHTML=`<span class="total">Total $</span><span class="precio_total">${Total}</span>` //Mostrar el total en pantalla 
}

function ContadorDeArticulos(){
    const contadorCarrito =document.querySelector(".contador_carrito")
    const Contador =contenedorCarrito.reduce((acumulador,item)=> acumulador + item.Cantidad, 0)//este metodo es una especie de contador y all final un 0 para que no queden espacios
    contadorCarrito.innerHTML=`<span>${Contador}</span> ` //Mostar total en pantalla
}
//Modifica la cantidad de productos en el carrito
function CantidadNumber(){
const cantidadInputs=document.querySelectorAll(".cantidad")// todos los elementos que tengan la clase cantidad
cantidadInputs.forEach((input,index)=>{
    input.addEventListener("change",(e)=>{ //Detecta cuando el usuario cambia la cantidad, se activa cuando modificas el número

        if(e.target.classList.contains("cantidad")){// verifica que elemento disparo  el e.target de la clase cantidad
            contenedorCarrito[index].Cantidad=parseInt(e.target.value)|| 1 //Esto tiene tres partes contenedorCarrito[index], busca cual indice se esta modificando,y luego modifica la cantidad de veces que se modifique
            ActualizarTotalCompra()
            ContadorDeArticulos()
        }
    })
})
}

function  EliminarArticuloCarrito(){
    const BotonEliminar=document.querySelectorAll(".quitar") //Selecciona todos los elementos con la clase quitar, que es el boton de eliminar
    BotonEliminar.forEach(item=>{
        item.addEventListener("click", (e)=>{
            if(e.target.classList.contains("quitar")){
                const index= parseInt(e.target.getAttribute("data-index"))// se obtiene el atributo data-index (que seria alguno de estos 0,1,2) y lo transtransforma  el index en un numero entero
                contenedorCarrito.splice(index,1)//metodo para eliminar el index
                actualizarCarrito()
                ActualizarTotalCompra()
                ContadorDeArticulos()
                CantidadNumber()

            }
        })
    })
}