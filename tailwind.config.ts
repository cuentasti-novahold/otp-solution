import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    // Contenedor general
    'w-full',
    'bg-white',
    'min-h-screen',
    'p-5',
    'text-3xl',
    'font-bold',
    'mb-6',
    'text-black',
    'text-center',

    // Contenedores flex y spacing
    'flex',
    'justify-center',
    'gap-4',
    'mb-6',

    // Botones base
    'font-bold',
    'py-3',
    'px-6',
    'rounded-full',
    'shadow-md',
    'transition',
    'duration-300',

    // Estados dinámicos (condicionales)
    'bg-blue-600',
    'text-white',
    'hover:bg-blue-700',

    'bg-lime-500',
    'hover:bg-lime-600',

    'bg-gray-200',
    'text-black',
    'hover:bg-gray-300',

    // Texto explicativo
    'text-gray-700',
    'mb-4',

    // Tabla de datos
    'overflow-x-auto',
  ],

  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;
