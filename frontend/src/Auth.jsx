import { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('error');
    }
    return context;
};

const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(null);
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);

    const login = useCallback(async (email, password) => {
        setError(null);

        try {
            const response = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            

            const data = await response.json();

            if (!response.ok) {
                if (data.errores && data.errores.length > 0) {
                    throw new Error(data.errores[0].msg);
                }

                throw new Error(data.error || 'Error al iniciar sesión');
            }

            setToken(data.token);
            setUser(data.user);

            return { success: true };
        } catch (err) {
            setError(err.message);
            return { success: false };
        }
    }, []);



    const register = useCallback(async (nombre, email, password) => {
        setError(null);

        try {
            const response = await fetch('http://localhost:3000/api/auth/registro', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre, email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.errores && data.errores.length > 0) {
                    throw new Error(data.errores[0].msg);
                }
                throw new Error(data.error || 'Error al registrar usuario');
            }
            return { success: true };
        } catch (err) {
            setError(err.message);
            return { success: false };
        }
    }, []);




    const logout = useCallback(() => {
        setToken(null);
        setUser(null);
        setError(null);
    }, []);


    const fetchAuth = useCallback(
        async (url, options = {}) => {
            if (!token) {
                throw new Error('No has iniciado sesión');
            }

            return fetch(url, {
                ...options,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    ...(options.headers || {}),
                },
            });
        },
        [token]
    );

    const value = {
        token,
        user,
        error,
        login,
        register,
        logout,
        fetchAuth,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;