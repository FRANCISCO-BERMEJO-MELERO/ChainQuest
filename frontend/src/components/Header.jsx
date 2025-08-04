import { useEffect, useState } from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'
import { useRegistryWriteContract } from '../hooks/useNFTWriteContract'

export default function Header() {
  const { address, isConnected } = useAccount()
  const { contract } = useRegistryWriteContract()
  const [hasMinted, setHasMinted] = useState(false)

  useEffect(() => {
    const checkMintStatus = async () => {
      if (contract && address) {
        try {
          const result = await contract.hasMinted(address)
          setHasMinted(result)
        } catch (error) {
          console.error('Error al verificar si ya mintéo:', error)
        }
      }
    }

    checkMintStatus()
  }, [contract, address])

  const handleGetAdventurer = async () => {
    if (!contract) {
      console.error('Contrato no inicializado')
      return
    }

    try {
      const tx = await contract.safeMint()
      console.log('Transacción enviada:', tx)
      await tx.wait()
      console.log('Transacción confirmada:', tx)
      alert('¡Aventurero conseguido!')
      setHasMinted(true)
    } catch (error) {
      console.error('Error al conseguir aventurero:', error)
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
          </>
        )}
        <ConnectButton />
      </div>
    </header>
  )
}
