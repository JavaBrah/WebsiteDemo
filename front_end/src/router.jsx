import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import HomePage from "./pages/HomePage";

const router = createBrowserRouter([
    {
        path:'/',
        element: <App/>,
        children: [
            {
                index:true,
                element: <HomePage/>
            }
        ]
    }
])

export default router;