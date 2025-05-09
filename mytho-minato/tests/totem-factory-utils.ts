import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts"
import { TotemCreated } from "../generated/TotemFactory/TotemFactory"

export function createTotemCreatedEvent(
  totemAddr: Address,
  totemTokenAddr: Address,
  totemId: BigInt
): TotemCreated {
  let totemCreatedEvent = changetype<TotemCreated>(newMockEvent())

  totemCreatedEvent.parameters = new Array()

  totemCreatedEvent.parameters.push(
    new ethereum.EventParam("totemAddr", ethereum.Value.fromAddress(totemAddr))
  )
  totemCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "totemTokenAddr",
      ethereum.Value.fromAddress(totemTokenAddr)
    )
  )
  totemCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "totemId",
      ethereum.Value.fromUnsignedBigInt(totemId)
    )
  )

  return totemCreatedEvent
}
