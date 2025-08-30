import { createContext, useContext, useState } from "react"

type User = {
    email:string,
} | null;

const AuthContext = createContext<{
    user: User,
    isAllowed: Boolean,
    login: (email: string) => void,
    logout: () => void,
} | null> (null); 

//medio para exponer la manipulacion de estado a la aplicacion o componentes hijos
export const AuthProvider = ({children}: {children: React.ReactNode}) => {
    const [user, setUser] = useState<User>(null);
    const [isAllowed, setIsAllowed] = useState<Boolean>(false);

    const login = (email: any) =>{
        setUser({email: email});
        setIsAllowed(true);
    }
    const logout = () => {
        setUser(null);
        setIsAllowed(false);
    }
    return (
        <AuthContext.Provider value={{user, isAllowed, login, logout}}>
            {children}
        </AuthContext.Provider>
    )
}

//hook para utilizar el contexto en componentes personalizados (e.g login, home)
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
    return context;
}