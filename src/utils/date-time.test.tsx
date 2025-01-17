/* eslint-disable global-require */
import { isProperTimezone, useDateTime } from "./date-time"
import { testHook } from "./test-utils"

jest.mock("store/redux-separate-context", () => ({
  useSelector: () => "default",
}))
jest.mock("../domains/global/selectors", () => ({
  selectTimezone: () => "mock",
}))

describe("isProperTimezone", () => {
  it("return false on improper timezone", () => {
    expect(isProperTimezone("EEST")).toBe(false)
  })
  it("returns true on proper timezone", () => {
    expect(isProperTimezone("Europe/Athens")).toBe(true)
  })
})

let dateTime: {
  localeDateString: any
  localeTimeString: any
  xAxisTimeString: any
}

beforeEach(() => {
  testHook(() => {
    dateTime = useDateTime()
  })
})

describe("useDateTime", () => {
  it("returns 3 formatters", () => {
    const { localeDateString, localeTimeString, xAxisTimeString } = dateTime
    expect(typeof localeDateString).toBe("function")
    expect(typeof localeTimeString).toBe("function")
    expect(typeof xAxisTimeString).toBe("function")

    const date = new Date()
    expect(typeof localeDateString(date)).toBe("string")
    expect(typeof localeTimeString(date)).toBe("string")
    expect(typeof xAxisTimeString(date)).toBe("string")
  })

  it("uses old formatters when Intl.DateTimeFormat is not available", () => {
    // some tweaks to force re-running the date-time module
    // (with overriden window.Intl property)
    jest.resetModules()

    // turn off Intl (simulate older browsers)
    const windowIntl = Intl
    // @ts-ignore
    window.Intl = undefined
    const newInstance = require("./date-time")
    const { testHook: testHookNewInstance } = require("utils/test-utils")

    const { configure } = require("enzyme")
    const Adapter = require("enzyme-adapter-react-16")

    configure({ adapter: new Adapter() })

    testHookNewInstance(() => {
      dateTime = newInstance.useDateTime()
    })
    const { localeDateString, localeTimeString, xAxisTimeString } = dateTime
    expect(localeDateString).toBe(newInstance.localeDateStringNative)
    expect(localeTimeString).toBe(newInstance.localeTimeStringNative)
    expect(xAxisTimeString).toBe(newInstance.xAxisTimeStringNative)
    expect(typeof localeDateString).toBe("function")
    // @ts-ignore
    window.Intl = windowIntl
  })

  it("formats dates", () => {
    const { localeDateString, localeTimeString, xAxisTimeString } = dateTime
    expect(typeof localeDateString).toBe("function")
    expect(typeof localeTimeString).toBe("function")
    expect(typeof xAxisTimeString).toBe("function")

    const date = new Date("Sep 15, 2021, 00:30:45")
    expect(localeDateString(date)).toBe("Wed, Sep 15, 2021")
    expect(localeDateString(date, { long: false })).toBe("9/15/21")
    expect(localeTimeString(date)).toBe("00:30:45")
    expect(localeTimeString(date, { secs: false })).toBe("00:30")
    expect(xAxisTimeString(date)).toBe("00:30:45")
  })
})
