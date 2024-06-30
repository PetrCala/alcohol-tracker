import Foundation

struct UnitModel: Hashable {
    let unitName: String
    let unitValue: Int

    static func getUnits() -> [UnitModel] {
        return [
            UnitModel(unitName: "Unit 1", unitValue: 1),
            UnitModel(unitName: "Unit 2", unitValue: 2),
            UnitModel(unitName: "Unit 3", unitValue: 3)
        ]
    }
}
