import Foundation

class SessionModel {
    static let shared = SessionModel()

    private(set) var unitCount: Int = 0
    private(set) var isActive: Bool = false

    private init() { }

    func startSession() {
        unitCount = 0
        isActive = true
    }

    func endSession() {
        isActive = false
    }

    func addUnit() {
        guard isActive else { return }
        unitCount += 1
    }

    func subtractUnit() {
        guard isActive else { return }
        if unitCount > 0 {
            unitCount -= 1
        }
    }
}
