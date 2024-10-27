const http = require('http');
const assert = require('assert');
const server = require('./index');
const PORT = 3000;



function makeRequest(options, callback) {
    const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        res.on('end', () => {
            callback(null, res, data);
        });
    });

    req.on('error', (err) => {
        callback(err);
    });

    req.end();
}

// Pruebas
const tests = [
    {
        name: 'Debe responder con un listado de animes',
        options: {
            hostname: 'localhost',
            port: 3000,
            path: '/api/anime',
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        },
        expectedStatusCode: 200,
        test(response, data) {
            assert.strictEqual(response.statusCode, 200, 'El código de estado debe ser 200');
            assert.doesNotThrow(() => JSON.parse(data), 'La respuesta debe ser un JSON válido');
        },
    },
    {
        name: 'Debe devolver un error 404 si el anime no existe',
        options: {
            hostname: 'localhost',
            port: 3000,
            path: '/api/anime/9999', // Un ID que no existe
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        },
        expectedStatusCode: 404,
        test(response) {
            assert.strictEqual(response.statusCode, 404, 'El código de estado debe ser 404');
        },
    },
    {
        name: 'Debe responder con un anime',
        options: {
            hostname: 'localhost',
            port: 3000,
            path: '/api/anime/2',
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        },
        expectedStatusCode: 200,
        test(response, data) {
            assert.strictEqual(response.statusCode, 200, 'El código de estado debe ser 200');
            assert.doesNotThrow(() => JSON.parse(data), 'La respuesta debe ser un JSON válido');
        },
    },
];

// Ejecutar pruebas
function runTests() {
    let passed = 0;
    let failed = 0;

    tests.forEach((test, index) => {
        makeRequest(test.options, (err, res, data) => {
            if (err) {
                console.error(`❌ ${test.name} - Error en la solicitud: ${err.message}`);
                failed++;
            } else {
                try {
                    test.test(res, data);
                    console.log(`✅ ${test.name}`);
                    passed++;
                } catch (error) {
                    console.error(`❌ ${test.name} - ${error.message}`);
                    failed++;
                }
            }

            if (index === tests.length - 1) {
                console.log(`\nResultados: ${passed} pasaron, ${failed} fallaron`);
            }
        });
    });
}

// Iniciar pruebas
if (!server.listening) {
    server.listen(PORT, () => {
        console.log(`Servidor para pruebas ejecutándose en el puerto ${PORT}`);
        runTests();
    });
} else {
    console.log('El servidor ya está en ejecución.');
    runTests(); 
}