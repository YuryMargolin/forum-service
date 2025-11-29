const errorHandler = (err, req, res, next) => {
    console.log(err.stack);
    const contains = err.message.includes('not found');

    if (err.message && contains) {
        return res.status(404).json({
            status: 'Not Found',
            code: 404,
            message: err.message,
            path: req.path
        });
    }

    return res.status(500).json({
        status: 'Internal Server Error',
        code: 500,
        message: err.message,
        path: req.path
    })
}

export default errorHandler;