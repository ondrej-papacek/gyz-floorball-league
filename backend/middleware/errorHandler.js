const errorHandler = (err, req, res, next) => {
    console.error('Chyba:', err.message || 'Neočekávaná chyba.');

    res.status(err.status || 500).json({
        chyba: err.message || 'Došlo k neočekávané chybě na serveru.',
    });
};

module.exports = errorHandler;
