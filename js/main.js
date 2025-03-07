
//Codigo

let calcular = document.getElementById("btnCalcular");
let alto = document.getElementById("txtAlto");
let ancho = document.getElementById("txtAncho");
let largo = document.getElementById("txtLargo");
let peso = document.getElementById("txtPeso");
let resultado = document.getElementById("resultado");

let historial = document.getElementById("historial") // Div para guardar el historial de precios 

let historialPrecios = JSON.parse(localStorage.getItem("historialPrecios")) || [];

verHistorial();

calcular.onclick = () => {

    if(!validarisNaN()){
        return;
    }

    let total = parseFloat(alto.value) + parseFloat(ancho.value) + parseFloat(largo.value) + parseFloat(peso.value);

    let precio;

    if(total<=20){
        precio = 10000;
    } else if (total >= 21 && total <= 30) {
        precio = 20000;
    } else if (total >= 31 && total <= 40) {
        precio = 30000;
    } else {
        precio = 40000;
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
    historial.innerHTML = "<h2>Historial de calculos</h2>"

    historialPrecios.forEach((precio, index)=>{
        historial.innerHTML += `<p> ${index+1}. precio $${precio}</p>`;
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




