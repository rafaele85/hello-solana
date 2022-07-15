import {
    AccountMeta,
    Connection,
    Keypair,
    LAMPORTS_PER_SOL,
    PublicKey,
    sendAndConfirmTransaction, Transaction,
    TransactionInstruction
} from "@solana/web3.js";
import * as path from "path";
import {fs} from "mz";

const PROGRAM_KEYPAIR_PATH = path.join(
    path.resolve(__dirname, '../../dist/program'),
    'hello_solana-keypair.json'
)

const runProgram = async () => {
    console.log('---starting main')

    // this is our program's keypair and programId
    const secretKeyString = await fs.readFile(PROGRAM_KEYPAIR_PATH, {encoding: 'utf8'})
    const secretKey = Uint8Array.from(JSON.parse(secretKeyString))
    const programKeypair = Keypair.fromSecretKey(secretKey)
    const programId: PublicKey = programKeypair.publicKey

    // this is sample "client" account
    const triggerKeypair = Keypair.generate()
    const numberOfSolsToAirdrop = 1

    const connection = new Connection('https://api.devnet.solana.com', 'confirmed')

    const airdropRequest = await connection.requestAirdrop(triggerKeypair.publicKey, numberOfSolsToAirdrop * LAMPORTS_PER_SOL)
    await connection.confirmTransaction(airdropRequest)

    console.log('----pinging program ', programId.toBase58())

    const triggerKey: AccountMeta = {pubkey: triggerKeypair.publicKey, isSigner: false, isWritable: false}
    const data = Buffer.alloc(0)

    const instruction = new TransactionInstruction({
        keys: [triggerKey],
        programId,
        data
    })

    const transaction = new Transaction()
    transaction.add(instruction)

    await sendAndConfirmTransaction(connection, transaction, [triggerKeypair])
}

const main = async () => {
    try {
        await runProgram()
    } catch (err) {
        console.error('---ERRORR ', err)
    }
}

void main()
