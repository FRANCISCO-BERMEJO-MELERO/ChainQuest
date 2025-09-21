import { useEffect, useState } from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'
import { useAdventurerContract } from '../hooks/contracts/useAdventurerContract'

export default function HeaderParchment() {
  const { address } = useAccount()
  const { contractRead, contractWrite } = useAdventurerContract()
  const [hasMinted, setHasMinted] = useState(false)

  useEffect(() => {
    const run = async () => {
      if (contractRead && address) {
        try { setHasMinted(await contractRead.hasMinted(address)) } catch(err) {
          console.error(err)
        }
      }
    }
    run()
  }, [contractRead, address])

  const handleGetAdventurer = async () => {
    if (!contractWrite) return
    try { const tx = await contractWrite.safeMint(); await tx.wait(); setHasMinted(true) } catch(err) {
      console.error(err)
    }
  }

  return (
<div className="sticky top-4 z-50">
  <div className="mx-auto max-w-6xl px-6 py-3 flex items-center justify-between">
    {/* Marca */}
    <div className="flex items-center gap-2">
      <span className="text-3xl">🗡️</span>
      <div>
        <h1 className="text-3xl font-extrabold text-[#f7eac4] tracking-wide">
          ChainQuest
        </h1>
        <p className="text-base text-[#f7eac4] italic -mt-1">
          Aventureros Web3
        </p>
      </div>
    </div>

    {/* Navegación */}
    <nav className="hidden md:block">
      <ul className="flex gap-6">
        {['Inicio', 'Acerca', 'Contacto'].map((l) => (
          <li key={l}>
            <a
              href={l === 'Inicio' ? '/' : `/${l.toLowerCase()}`}
              className="px-3 py-1.5 rounded-lg text-lg font-bold text-[#f7eac4] hover:text-[#433725] transition"
            >
              {l}
            </a>
          </li>
        ))}
      </ul>
    </nav>

    {/* Acciones */}
    <div className="flex items-center gap-4">
      {!hasMinted ? (
        <button
          onClick={handleGetAdventurer}
          className="px-5 py-2 rounded-lg text-lg font-bold border border-[#a77a2d] bg-gradient-to-b from-[#f2d98c] to-[#d4a962] text-[#3b2a1a] shadow"
        >
          Conseguir Aventurero
        </button>
      ) : (
        <span className="px-4 py-2 rounded-lg text-lg font-bold border border-green-700 text-green-800 bg-green-200/70">
          ✔ Aventurero listo
        </span>
      )}
      <ConnectButton />
    </div>
  </div>
</div>

  )
}
