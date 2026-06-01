'use strict'


let contenedorCarrito=[]



const tarjetaProducto =document.querySelectorAll(".tarjeta") //llamar a la clase de cada producto como un nodo iterable () 

tarjetaProducto.forEach(tarjeta => {
    tarjeta.addEventListener("click", e=>{ // crea el evento click y muestra cada parte que  se seleccione sea img , titulo o boton
    if(e.target.closest(".boton")){
        const infoProducto={
            Imagen:tarjeta.querySelector("img").src,
            Cantidad:1,
            Nombre:tarjeta.querySelector(".nombre").textContent,
            Precio: parseFloat(tarjeta.querySelector(".precio").textContent.slice(1)) //Slice recorre el $ y lo borra dejando solo el numero, para que despues se vayan sumando los precios  
        }
        
        const ProductoExistente= contenedorCarrito.find(producto => infoProducto.Nombre === producto.Nombre)// busca si el producto seleccionado es el mismo que el encontrado en el carrito
        if(ProductoExistente){
            ProductoExistente.Cantidad++
        }else{
            contenedorCarrito.push(infoProducto)//Agregamos el item a la lista 
        }
        actualizarCarrito()               
    }     
         
    })
})

//const objetivo = e.target.closest(".boton")//  selecciono que solo sea el boton el que haga click o el que este mas serca 
//const titulo= tarjeta.querySelector(".nombre").textContent //Desde la clase nombre extraigo solo el texto 


const ListadoCarrito= document.querySelector(".listado_carrito")
function actualizarCarrito(){
    ListadoCarrito.innerHTML="" //cada vez que se actualice se va limpiar el carrito
    contenedorCarrito.forEach((item,index)=>{//recorre cada elemento contenido en ese array, index es para poder eliminarlos
    const li= document.createElement("li") //Se crea unaa etiqueta li con los items que se van agregar 
    li.classList.add("info_carrito")
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
    ListadoCarrito.appendChild(li) 
    })
    ActualizarTotalCompra()
    ContadorDeArticulos()
    CantidadNumber()
    EliminarArticuloCarrito()
}

function ActualizarTotalCompra(){
   const TotalDeCompra =document.querySelector(".total_carrito")
   const Total =contenedorCarrito.reduce((acumulador,item)=> acumulador + item.Precio*item.Cantidad, 0)//este metodo es una especie de contador y al final un 0 para que no queden espacios
    TotalDeCompra.innerHTML=`<span class="total">Total $</span><span class="precio_total">${Total}</span>`
}

function ContadorDeArticulos(){
    const contadorCarrito =document.querySelector(".contador_carrito")
    const Contador =contenedorCarrito.reduce((acumulador,item)=> acumulador + item.Cantidad, 0)//este metodo es una especie de contador y all final un 0 para que no queden espacios
    contadorCarrito.innerHTML=`<span>${Contador}</span> `
}

function CantidadNumber(){
const cantidadInputs=document.querySelectorAll(".cantidad")// todos los elementos que tengan la clase cantidad
cantidadInputs.forEach((input,index)=>{
    input.addEventListener("change",(e)=>{

        if(e.target.classList.contains("cantidad")){// verifica que elemento disparo  el e.target de la clase cantidad
            contenedorCarrito[index].Cantidad=parseInt(e.target.value)|| 1 //Esto tiene tres partes contenedorCarrito[index], busca cual indice se esta modificando,y luego modifica la cantidad de veces que se modifique
            ActualizarTotalCompra()
            ContadorDeArticulos()
        }
    })

})
}

function  EliminarArticuloCarrito(){
    const BotonEliminar=document.querySelectorAll(".quitar")
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