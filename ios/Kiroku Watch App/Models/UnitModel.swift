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
            UnitModel(unitName: "Small Beer", unitId: 1, unitImageName: "unit_beer"),
            UnitModel(unitName: "Beer", unitId: 2, unitImageName: "unit_beer"),
            UnitModel(unitName: "Wine", unitId: 3, unitImageName: "unit_wine"),
            UnitModel(unitName: "Weak Shot", unitId: 4, unitImageName: "unit_shotglass_small"),
            UnitModel(unitName: "Strong Shot", unitId: 5, unitImageName: "unit_shotglass_large"),
            UnitModel(unitName: "Cocktail", unitId: 6, unitImageName: "unit_cocktail"),
            UnitModel(unitName: "Other", unitId: 7, unitImageName: "unit_other"),
        ]
    }
}
