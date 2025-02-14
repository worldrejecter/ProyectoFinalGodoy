

/*function convertirCelsiusAFahrenheit(celsius) {
    return (celsius * 9/5) + 32;
}


console.log(convertirCelsiusAFahrenheit(35)); 


function contarVocales(texto) {
    let coincidencias = texto.match(/[aeiouAEIOUáéíóúÁÉÍÓÚ]/g);
    return coincidencias ? coincidencias.length : 0;
}

console.log(contarVocales("Furina de Fontaine"));*/


// Función 1: Calcula la cuota mensual del crédito
function calcularCuotaMensual(monto, tasaInteresAnual, plazoMeses) {
    let tasaInteresMensual = (tasaInteresAnual / 100) / 12;
    return monto * (tasaInteresMensual * Math.pow(1 + tasaInteresMensual, plazoMeses)) / 
           (Math.pow(1 + tasaInteresMensual, plazoMeses) - 1);
}

// Función 2: Genera el cronograma de pagos mensuales
function generarCronograma(monto, tasaInteresAnual, plazoMeses, cuotaMensual) {
    let tasaInteresMensual = (tasaInteresAnual / 100) / 12;
    let saldoPendiente = monto;
    let totalInteresPagado = 0;

    console.log("\n📌 Cronograma de pagos:");
    console.log("Mes | Cuota | Interés | Capital | Saldo Restante");
    console.log("------------------------------------------------");

    for (let mes = 1; mes <= plazoMeses; mes++) {
        let interesMensual = saldoPendiente * tasaInteresMensual;
        let capitalPagado = cuotaMensual - interesMensual;
        saldoPendiente -= capitalPagado;
        totalInteresPagado += interesMensual;

        console.log(`${mes} | $${cuotaMensual.toFixed(2)} | $${interesMensual.toFixed(2)} | $${capitalPagado.toFixed(2)} | $${saldoPendiente.toFixed(2)}`);
    }

    console.log("\n📊 Resumen:");
    console.log(`💰 Cuota mensual fija: $${cuotaMensual.toFixed(2)}`);
    console.log(`📉 Total de intereses pagados: $${totalInteresPagado.toFixed(2)}`);
    console.log(`💳 Total a pagar al final del crédito: $${(cuotaMensual * plazoMeses).toFixed(2)}`);
}

// Función 3: Controla el flujo del simulador y permite repetir el cálculo
function simuladorCredito() {
    let continuar = true;

    while (continuar) {
        let monto = parseFloat(prompt("Ingrese el monto del préstamo: "));
        let tasaInteresAnual = parseFloat(prompt("Ingrese la tasa de interés anual (%): "));
        let plazoMeses = parseInt(prompt("Ingrese el plazo en meses: "));

        if (isNaN(monto) || isNaN(tasaInteresAnual) || isNaN(plazoMeses) || monto <= 0 || tasaInteresAnual < 0 || plazoMeses <= 0) {
            console.log("❌ Error: Ingrese valores numéricos válidos.");
            continue;
        }

        let cuotaMensual = calcularCuotaMensual(monto, tasaInteresAnual, plazoMeses);
        generarCronograma(monto, tasaInteresAnual, plazoMeses, cuotaMensual);

        continuar = confirm("¿Desea calcular otro crédito?");
    }

    console.log("✅ Gracias por usar el simulador de crédito.");
}

// Ejecutar el simulador
simuladorCredito();






