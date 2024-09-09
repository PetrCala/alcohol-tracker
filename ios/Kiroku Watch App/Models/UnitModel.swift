import Foundation

struct UnitModel: Hashable {
    let unitName: String
    let unitId: Int
    let unitImageName: String
    let makeSmaller: Bool?

    static func getUnit(withName unitName: String) -> UnitModel? {
        return getUnits().first { $0.unitName == unitName }
    }

    static func getUnits() -> [UnitModel] {
        return [
            UnitModel(unitName: "Small Beer", unitId: 1, unitImageName: "unit_beer", makeSmaller: true),
            UnitModel(unitName: "Beer", unitId: 2, unitImageName: "unit_beer", makeSmaller: nil),
            UnitModel(unitName: "Wine", unitId: 3, unitImageName: "unit_wine", makeSmaller: nil),
            UnitModel(unitName: "Weak Shot", unitId: 4, unitImageName: "unit_shotglass_small", makeSmaller: nil),
            UnitModel(unitName: "Strong Shot", unitId: 5, unitImageName: "unit_shotglass_large", makeSmaller: nil),
            UnitModel(unitName: "Cocktail", unitId: 6, unitImageName: "unit_cocktail", makeSmaller: nil),
            UnitModel(unitName: "Other", unitId: 7, unitImageName: "unit_other", makeSmaller: nil),
        ]
    }
}
