import SwiftUI

struct UnitSelectionView: View {
    @State private var selectedUnit: UnitModel?
    let units = UnitModel.getUnits()

    var body: some View {
        Picker("Select Unit", selection: $selectedUnit) {
            ForEach(units, id: \.unitValue) { unit in
                Text(unit.unitName).tag(unit as UnitModel?)
            }
        }
    }
}
