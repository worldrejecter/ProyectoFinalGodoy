
//Codigo

//botones
let calcular = document.getElementById("btnCalcular");
let borrarHistorial = document.getElementById("btnBorrarHistorial");

//textbox
let alto = document.getElementById("txtAlto");
let ancho = document.getElementById("txtAncho");
let largo = document.getElementById("txtLargo");
let peso = document.getElementById("txtPeso");

//H1
let resultado = document.getElementById("resultado"); // Para mostrar el resultado de calcular

//div
let historial = document.getElementById("historial") // Div para guardar el historial de precios 
let historialContainer = document.getElementById("historial-container");

//array
let historialPrecios = JSON.parse(localStorage.getItem("historialPrecios")) || [];



verHistorial();

calcular.onclick = () => {

    if(!validarisNaN()){
        return;
    }

    let total = parseFloat(alto.value) + parseFloat(ancho.value) + parseFloat(largo.value) + parseFloat(peso.value);

    let precio;

    if(total<=30){
        precio = 10000;
    } else if (total >= 31 && total <= 50) {
        precio = 20000;
    } else if (total >= 51 && total <= 70) {
        precio = 30000;
    } else if (total >= 71 && total <= 90) {
        precio = 40000;
    } else {
        precio = 50000;
    }

    historialPrecios.push(precio);
    localStorage.setItem("historialPrecios", JSON.stringify(historialPrecios));

    resultado.innerHTML = `El valor de su envío sería: $${precio}`;

    verHistorial();

    limpiarCampos();
}

function limpiarCampos() {
    alto.value = "";
    ancho.value = "";
    largo.value = "";
    peso.value = "";
}

function verHistorial () {

    if (historialPrecios.length === 0) {
        historialContainer.style.display = "none";
        return;
    }


    historial.innerHTML = "<h2>Historial de calculos</h2>"

    historialContainer.style.display = "block";

    historialPrecios.forEach((precio, index)=>{
        historial.innerHTML += `<p> ${index+1}. Precio: $${precio}</p>`;
    })
}

function validarisNaN() {

    let total = parseFloat(alto.value) + parseFloat(ancho.value) + parseFloat(largo.value) + parseFloat(peso.value);

    if (isNaN(total)){
        resultado.innerHTML = "Ingrese solo números en todos los campos"
        return false;
    }

    return true;
}

borrarHistorial.onclick = () => {
    historialPrecios = [];
    localStorage.removeItem("historialPrecios");
    verHistorial();

};



