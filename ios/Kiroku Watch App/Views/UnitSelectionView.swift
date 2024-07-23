import SwiftUI

struct UnitView: View {
    let unit: UnitModel
    let isSelected: Bool
    let outerGeometry: GeometryProxy
    let innerGeometry: GeometryProxy
    let frameHeight: CGFloat
    let updateSelectedUnit: (GeometryProxy, GeometryProxy, Int) -> Void
    
    var body: some View {
        HStack {
            Text(unit.unitName)
                .font(.body)
            
            Spacer()
            
            Image(unit.unitImageName)
                .resizable()
                .renderingMode(.template)
                .foregroundColor(.white)
                .scaledToFit()
                .frame(width: frameHeight / 2, height: frameHeight / 2)
                // .renderingMode(.template)
                // .foregroundColor(AppColors.contrastColor.opacity(0.1))
        }
        .frame(width: outerGeometry.size.width - 32)
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 10)
                .stroke(isSelected ? AppColors.primaryColor : Color.gray)
                .background(isSelected ? AppColors.primaryColor.opacity(0.1) : Color.clear)
        )
        .onAppear {
            updateSelectedUnit(innerGeometry, outerGeometry, unit.unitId)
        }
        .onChange(of: innerGeometry.frame(in: .global).midY) { oldValue, newValue in
            updateSelectedUnit(innerGeometry, outerGeometry, unit.unitId)
        }
        // Deprecated
        // .onChange(of: innerGeometry.frame(in: .global).midY) { _ in
        //     updateSelectedUnit(innerGeometry, outerGeometry, unit.unitId)
        // }
        .frame(height: frameHeight)
    }
}

struct UnitSelectionView: View {
    @State private var selectedUnitId: Int? = nil
    let units: [UnitModel] = UnitModel.getUnits()
    let frameHeight: CGFloat = 60

    var body: some View {
            GeometryReader { outerGeometry in
                ScrollView {
                    LazyVStack(spacing: 0) {
                        ForEach(units, id: \.unitId) { unit in
                            GeometryReader { innerGeometry in
                                UnitView(
                                    unit: unit,
                                    isSelected: selectedUnitId == unit.unitId,
                                    outerGeometry: outerGeometry,
                                    innerGeometry: innerGeometry,
                                    frameHeight: frameHeight,
                                    updateSelectedUnit: updateSelectedUnit
                                )
                                .frame(height: frameHeight)
                            }
                            .frame(height: frameHeight)
                        }
                    }
                    .padding()

                    // Add space below the stack for the last item
                    // to be centered when it's selected
                    Spacer().frame(height: outerGeometry.size.height / 2)
                }
            }
        }


    private func updateSelectedUnit(innerGeometry: GeometryProxy, outerGeometry: GeometryProxy, unitId: Int) {
        let globalCenterY = innerGeometry.frame(in: .global).midY
        let outerCenterY = outerGeometry.size.height / 2

        DispatchQueue.main.async {
            if abs(globalCenterY - outerCenterY) < 30 { // Adjust the tolerance as necessary
                selectedUnitId = unitId
            }
        }
    }

}

struct UnitSelectionView_Previews: PreviewProvider {
    static var previews: some View {
        UnitSelectionView()
    }
}