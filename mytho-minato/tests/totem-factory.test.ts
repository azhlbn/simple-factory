import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { Address, BigInt } from "@graphprotocol/graph-ts"
import { TotemCreated } from "../generated/schema"
import { TotemCreated as TotemCreatedEvent } from "../generated/TotemFactory/TotemFactory"
import { handleTotemCreated } from "../src/totem-factory"
import { createTotemCreatedEvent } from "./totem-factory-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let totemAddr = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let totemTokenAddr = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let totemId = BigInt.fromI32(234)
    let newTotemCreatedEvent = createTotemCreatedEvent(
      totemAddr,
      totemTokenAddr,
      totemId
    )
    handleTotemCreated(newTotemCreatedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("TotemCreated created and stored", () => {
    assert.entityCount("TotemCreated", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "TotemCreated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "totemAddr",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "TotemCreated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "totemTokenAddr",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "TotemCreated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "totemId",
      "234"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
