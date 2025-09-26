export default function Custom404() {
    return (
        <main className="h-screen flex flex-col items-center justify-center bg-white">
            <h1 className="text-6xl font-bold text-red-600">404</h1>
            <p className="text-gray-700 mt-4 text-lg">Página no encontrada</p>
            <p className="text-gray-500 mt-2">
                Solo puedes ingresar desde los enlaces oficiales:{" "}
                <strong>/arnova</strong> o <strong>/solvia</strong>
            </p>
        </main>
    );
}
