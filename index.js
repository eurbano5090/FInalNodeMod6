const http = require('http');
const fs = require('fs');
const url = require('url');
const path = require('path');
const PORT = 3000;


let rawdataS = fs.readFileSync(path.join(__dirname, 'anime.json'));
let anime = JSON.parse(rawdataS);

// Guardar datos en el archivo
const saveData = (callback) => {
    fs.writeFile(`anime.json`, JSON.stringify(anime, null, 2), (err) => {
        if (err) {
            console.error('Error al guardar los datos:', err);
            if (callback) callback(err);
        } else {
            console.log('Datos guardados correctamente');
            if (callback) callback(null);
        }
    });
};

// Configuración del servidor HTTP
const server = http.createServer((req, res) => {
    // Configuración de CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.setHeader('Allow', 'GET, POST, OPTIONS, PUT, DELETE');

    // Manejo de solicitudes OPTIONS para CORS
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;
    const method = req.method;

    // Ruta para: listarAnimes
    if (method === 'GET' && path === '/api/anime') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(anime));
        return;
    }

    // Ruta para: buscarAnimePorId
    if (method === 'GET' && path.startsWith('/api/anime/')) {
        const animeId = path.split('/').pop();
        const response = anime[animeId];
        if (response) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(response));
        } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Anime not found');
        }
        return;
    }

    // Ruta para: crearAnime
    if (method === 'POST' && path === '/api/anime') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            const newAnime = JSON.parse(body);
            const newId = (Object.keys(anime).length + 1).toString();
            anime[newId] = newAnime;
            saveData((err) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end('Error al guardar los datos');
                } else {
                    res.writeHead(201, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ id: newId, ...newAnime }));
                }
            });
        });
        return;
    }

    // Ruta para: actualizarAnime
    if (method === 'PUT' && path.startsWith('/api/anime/')) {
        const animeId = path.split('/').pop();
        if (anime[animeId]) {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            req.on('end', () => {
                anime[animeId] = JSON.parse(body);
                saveData((err) => {
                    if (err) {
                        res.writeHead(500, { 'Content-Type': 'text/plain' });
                        res.end('Error al guardar los datos');
                    } else {
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(anime[animeId]));
                    }
                });
            });
        } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Anime not found');
        }
        return;
    }

    // Ruta para: borrarAnime
    if (method === 'DELETE' && path.startsWith('/api/anime/')) {
        const animeId = path.split('/').pop();
        if (anime[animeId]) {
            delete anime[animeId];
            saveData((err) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end('Error al guardar los datos');
                } else {
                    res.writeHead(204);
                    res.end();
                }
            });
        } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Anime not found');
        }
        return;
    }

    // Ruta por defecto
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
});

// Iniciar el servidor
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
module.exports = server;

