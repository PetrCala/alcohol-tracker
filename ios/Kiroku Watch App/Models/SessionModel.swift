import Combine
import Foundation

class SessionModel: ObservableObject {
    static let shared = SessionModel()

    @Published private(set) var unitCount: Int = Constants.Session.initialUnitCount
    @Published private(set) var isActive: Bool = false

    private init() { }

    func startSession() {
        unitCount = Constants.Session.initialUnitCount
        isActive = true
    }

    func saveSession() {
        unitCount = Constants.Session.initialUnitCount
        isActive = false
    }

    func discardSession() {
        unitCount = Constants.Session.initialUnitCount
        isActive = false
    }

    func addUnit() {
        // guard isActive else { return }
        unitCount += 1
    }

    func subtractUnit() {
        // guard isActive else { return }
        if unitCount > 0 {
            unitCount -= 1
        }
    }
}
