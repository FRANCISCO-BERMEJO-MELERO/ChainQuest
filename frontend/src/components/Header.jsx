import { useEffect, useState } from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'
import { useAdventurerContract } from '../hooks/contracts/useAdventurerContract'

export default function Header() {
  const { address} = useAccount()
  const { contractRead, contractWrite } = useAdventurerContract()
  const [hasMinted, setHasMinted] = useState(false)




  // 📌 Verificar si el usuario ya tiene NFT
  useEffect(() => {
    const checkMintStatus = async () => {
      if (contractRead && address) {
        try {
          const result = await contractRead.hasMinted(address)
          setHasMinted(result)
        } catch (error) {
          console.error('Error al verificar si ya mintéo:', error)
        }
      }
    }
    checkMintStatus()
  }, [contractRead, address])

  // 📌 Función para mintear NFT
  const handleGetAdventurer = async () => {
    if (!contractWrite) return console.error('Contrato no inicializado')
    try {
      const tx = await contractWrite.safeMint()
      console.log('Transacción enviada:', tx)
      await tx.wait()
      setHasMinted(true)
      alert('¡Aventurero conseguido!')
    } catch (error) {
      console.error('Error al conseguir aventurero:', error)
    }
  }


  // ...
  return (
    <header className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur text-white px-6 py-4 shadow-md flex justify-between items-center">
      {/* Marca */}
      <div>
        <h1 className="text-2xl font-bold text-yellow-400">ChainQuest</h1>
        <p className="text-sm text-gray-300">Aventureros Web3</p>
      </div>

      {/* Navegación */}
      <nav className="hidden md:block">
        <ul className="flex space-x-6 text-sm">
          <li><a href="/" className="hover:text-yellow-400 transition">Inicio</a></li>
          <li><a href="/about" className="hover:text-yellow-400 transition">Acerca</a></li>
          <li><a href="/contact" className="hover:text-yellow-400 transition">Contacto</a></li>
        </ul>
      </nav>

      {/* Acciones */}
      <div className="flex items-center space-x-3">
        {!hasMinted ? (
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            onClick={handleGetAdventurer}
          >
            Conseguir Aventurero
          </button>
        ) : (
          <span className="text-green-400 font-semibold">¡Ya eres un aventurero!</span>
        )}
        <ConnectButton />
      </div>
    </header>
  )

}
