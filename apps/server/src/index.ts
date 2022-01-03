import { app } from './app'

const PORT = parseInt(process.env.PORT) || 3001

const server = app.listen(PORT, () => {
    console.log(`Application started on port ${PORT}!`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
});

process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server')
    server.close(() => {
        console.log('HTTP server closed')
    })
})