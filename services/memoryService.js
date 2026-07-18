const SusanoMemory = require("../models/SusanoMemory");

async function obtenerMemoria(userId){

    let memoria = await SusanoMemory.findOne({userId});

    if(!memoria){

        memoria = await SusanoMemory.create({
            userId
        });

    }

    return memoria;

}

async function guardarRecuerdos(memoria,nuevosRecuerdos){

    if(!nuevosRecuerdos) return;

    if(Object.keys(nuevosRecuerdos).length===0) return;

    for(const [key,value] of Object.entries(nuevosRecuerdos)){

        memoria.usuario.datosClave.set(key,value);

    }

    await memoria.save();

}

module.exports={

    obtenerMemoria,
    guardarRecuerdos

};