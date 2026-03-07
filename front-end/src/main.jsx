import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { ThemeContextProvider } from './context/ThemeContext.jsx'
import { ClerkProvider } from '@clerk/clerk-react'
import { ssrDynamicImportKey } from 'vite/module-runner'
import { dark } from "@clerk/themes"

// Import your Publishable Key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error('Add your Clerk Publishable Key to the .env file')
}

createRoot(document.getElementById('root')).render(
    <ClerkProvider 
    appearance={{
        theme:dark,
        variables:{
            colorPrimary:"#4f39f6",
            colorTextOnPrimaryBackground:"#ffffff"
        }
    }}
    publishableKey={PUBLISHABLE_KEY} >
        <BrowserRouter>
            <ThemeContextProvider>
                <App />
            </ThemeContextProvider>
        </BrowserRouter>
    </ClerkProvider>,
)