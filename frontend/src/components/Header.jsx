import { useEffect, useState } from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'
import { useAdventurerContract } from '../hooks/useAdventurerContract'
import { useQuesManagerContract } from '../hooks/useQuesManagerContract'

export default function Header() {
  const { address, isConnected } = useAccount()
  const { contractRead, contractWrite } = useAdventurerContract()
  const { contractWriteQ } = useQuesManagerContract()
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

  // 📌 Función para añadir misión (solo owner)
  const handleAddQuest = async () => {
    try {
      const tx = await contractWriteQ.addQuest("Misión Debug: sube a nivel alto", 500)
      await tx.wait()
      alert("Misión añadida con éxito")
    } catch (error) {
      console.error("Error al añadir misión:", error)
    }
  }

  // 📌 Función para completar misión (jugador)
  const handleCompleteQuest = async () => {
    try {
      const tx = await contractWriteQ.completeQuest(1) // questId = 1
      await tx.wait()
      alert("¡Misión completada!")
    } catch (error) {
      console.error("Error al completar misión:", error)
    }
  }

  return (
    <header className="bg-gray-800 text-white p-4 shadow-md flex justify-between items-center">
      <h1 className="text-2xl font-bold">NFT Game</h1>

      <nav>
        <ul className="flex space-x-4">
          <li><a href="/" className="hover:underline">Home</a></li>
          <li><a href="/about" className="hover:underline">About</a></li>
          <li><a href="/contact" className="hover:underline">Contact</a></li>
        </ul>
      </nav>

      <div className="flex items-center space-x-4">
        {isConnected && (
          <>
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

            {/* Botones de test para misiones */}
            <button
              className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded"
              onClick={handleAddQuest}
            >
              Añadir misión (owner)
            </button>

            <button
              className="bg-yellow-500 hover:bg-yellow-600 text-black px-3 py-1 rounded"
              onClick={handleCompleteQuest}
            >
              Completar misión #1
            </button>
          </>
        )}
        <ConnectButton />
      </div>
    </header>
  )
}
