import Foundation

struct UnitModel: Hashable {
    let unitName: String
    let unitId: Int
    let unitImageName: String

    static func getUnit(withName unitName: String) -> UnitModel? {
        return getUnits().first { $0.unitName == unitName }
    }

    static func getUnits() -> [UnitModel] {
        return [
            UnitModel(unitName: "Small Beer", unitId: 1, unitImageName: "beer"),
            UnitModel(unitName: "Beer", unitId: 2, unitImageName: "beer"),
            UnitModel(unitName: "Wine", unitId: 3, unitImageName: "wineglass"),
            UnitModel(unitName: "Weak Shot", unitId: 4, unitImageName: "shotglass.small"),
            UnitModel(unitName: "Strong Shot", unitId: 5, unitImageName: "shotglass.large"),
            UnitModel(unitName: "Cocktail", unitId: 6, unitImageName: "cocktail"),
            UnitModel(unitName: "Other", unitId: 7, unitImageName: "units.other"),
        ]
    }
}
