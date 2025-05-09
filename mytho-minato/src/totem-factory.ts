import { TotemCreated as TotemCreatedEvent } from "../generated/TotemFactory/TotemFactory"
import { TotemCreated } from "../generated/schema"

export function handleTotemCreated(event: TotemCreatedEvent): void {
  let entity = new TotemCreated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.totemAddr = event.params.totemAddr
  entity.totemTokenAddr = event.params.totemTokenAddr
  entity.totemId = event.params.totemId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
