import { FC } from "react"
import { Outlet } from "react-router-dom"
import GuestSidebar from "./GuestSidebar"

const GuestLayout: FC = () => {

    return (
        <div className="flex flex-col min-h-screen">
            <div className="flex flex-1">
                <GuestSidebar />
                <main className="flex-grow p-2 bg-gray-50">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

export default GuestLayout