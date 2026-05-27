"use client";

import React, { useEffect, useState } from "react";
import DataTable from "./DataTable";
import ActiveUsers from "./ActiveUsers";
import { fetchUsersByCountry } from "@/app/api/service";

export interface OTP {
    fecha: string;
    telefonoCelular: string;
    codigoOtp: string;
    origenOperacion: string;
    estatus: string;
    tiempoExpiracion: string;
}

interface HomeProps {
    pais: "fc" | "fs";
}

type ArnovaCountry = "arnova" | "guatemala";

export default function Home({ pais }: HomeProps) {

    const [data, setData] = useState<OTP[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [showOtp, setShowOtp] = useState<boolean>(true);

    // Selector Arnova
    const [arnovaCountry, setArnovaCountry] =
        useState<ArnovaCountry>("arnova");

    const getCountryService = () => {

        // SOLVIA
        if (pais === "fs") {
            return "solvia";
        }

        // ARNOVA
        return arnovaCountry;
    };

    const getTitle = () => {

        if (pais === "fs") {
            return "VERIFICACIÓN OTP Y DESBLOQUEO – SOLVIA";
        }

        return arnovaCountry === "guatemala"
            ? "VERIFICACIÓN OTP Y DESBLOQUEO – ARNOVA"
            : "VERIFICACIÓN OTP Y DESBLOQUEO – ARNOVA";
    };

    const loadData = async () => {

        setLoading(true);

        try {

            const service = getCountryService();

            const users = await fetchUsersByCountry(service);

            setData(users);

        } catch (error) {

            console.error("Error fetching data:", error);

        } finally {

            setLoading(false);
        }
    };

    useEffect(() => {

        if (showOtp) {
            loadData();
        }

    }, [showOtp, pais, arnovaCountry]);

    return (
        <main className="w-full bg-white min-h-screen">

            <div className="p-5">

                {/* ========================= */}
                {/* HEADER */}
                {/* ========================= */}

                <div className="flex flex-col items-center mb-6">

                    <h1 className="text-3xl font-bold text-black text-center mb-5">
                        {getTitle()}
                    </h1>

                    {/* CONTROLES */}
                    <div className="flex items-center justify-center gap-4 flex-wrap mt-6 align-buttons">

                        {/* BOTONES */}
                        <div className="flex justify-center gap-3">

                            <button
                                onClick={() => {
                                    setShowOtp(true);
                                    loadData();
                                }}
                                className={`font-bold py-3 px-6 rounded-full shadow-md transition duration-300 margin-buttons ${showOtp
                                    ? "bg-blue-600 text-white hover:bg-blue-700"
                                    : "bg-gray-200 text-black hover:bg-gray-300"
                                    }`}
                            >
                                CÓDIGO OTP
                            </button>

                            <button
                                onClick={() => setShowOtp(false)}
                                className={`font-bold py-3 px-6 rounded-full shadow-md transition duration-300 ${!showOtp
                                    ? "bg-gray-300 text-black"
                                    : "bg-gray-200 text-black hover:bg-gray-300"
                                    }`}
                            >
                                DESBLOQUEO USUARIO SAFI
                            </button>

                        </div>

                    </div>

                </div>

                <div className="flex items-center justify-center mb-6 w-full">

                    {/* SELECTOR IZQUIERDA */}
                    {pais === "fc" && (
                        <div className="top-1/2 -translate-y-1/2 absolute-select">

                            <select
                                value={arnovaCountry}
                                onChange={(e) =>
                                    setArnovaCountry(
                                        e.target.value as ArnovaCountry
                                    )
                                }
                                className="
                    border
                    border-blue-500
                    rounded-lg
                    px-4
                    py-3
                    shadow-sm
                    text-sm
                    font-medium
                    min-w-[180px]
                    outline-none
                "
                            >
                                <option value="arnova">
                                    🇸🇻 El Salvador
                                </option>

                                <option value="guatemala">
                                    🇬🇹 Guatemala
                                </option>
                            </select>

                        </div>
                    )}

                    {/* TEXTO */}
                    <p className="text-center text-gray-700">
                        {showOtp
                            ? "En esta pantalla puedes visualizar los códigos generados en los últimos 10 minutos"
                            : "Aquí puedes desbloquear usuarios bloqueados del sistema SAFI"}
                    </p>

                </div>
                {/* TABLA */}
                <div className="overflow-x-auto">

                    {showOtp ? (
                        <DataTable
                            users={data}
                            loading={loading}
                        />
                    ) : (
                        <ActiveUsers
                            pais={getCountryService()}
                        />
                    )}

                </div>

            </div>

        </main>
    );
}