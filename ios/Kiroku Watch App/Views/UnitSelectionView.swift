import SwiftUI

struct UnitSelectionView: View {
    @State private var selectedUnitId: Int? = nil
    let units: [UnitModel] = UnitModel.getUnits()

    private func updateSelectedUnit(innerGeometry: GeometryProxy, outerGeometry: GeometryProxy, unitId: Int) {
        let globalCenterY = innerGeometry.frame(in: .global).midY
        let outerCenterY = outerGeometry.size.height / 2

        DispatchQueue.main.async {
            if abs(globalCenterY - outerCenterY) < 30 { // Adjust the tolerance as necessary
                selectedUnitId = unitId
            }
        }
        
        // if abs(globalCenterY - outerCenterY) < 30 { // Adjust the tolerance as necessary
        //     selectedUnitId = unitId
        // }
    }
    var body: some View {
            GeometryReader { outerGeometry in
                ScrollView {
                    LazyVStack(spacing: 0) {
                        ForEach(units, id: \.unitId) { unit in
                            GeometryReader { innerGeometry in
                                HStack {
                                    Text(unit.unitName)
                                        .font(.body)
                                    
                                    Spacer()
                                    
                                    Image(systemName: "checkmark")
                                        .resizable()
                                        .scaledToFit()
                                        .frame(width: 30, height: 30)
                                }
                                .frame(width: outerGeometry.size.width - 32)
                                .padding()
                                .background(
                                    RoundedRectangle(cornerRadius: 10)
                                        .stroke(selectedUnitId == unit.unitId ? AppColors.primaryColor : Color.gray)
                                        .background(selectedUnitId == unit.unitId ? AppColors.primaryColor.opacity(0.1) : Color.clear)
                                )
                                .onAppear {
                                    updateSelectedUnit(innerGeometry: innerGeometry, outerGeometry: outerGeometry, unitId: unit.unitId)
                                }
                                .onChange(of: innerGeometry.frame(in: .global).midY) { _ in
                                    updateSelectedUnit(innerGeometry: innerGeometry, outerGeometry: outerGeometry, unitId: unit.unitId)
                                }
                            }
                            .frame(height: 60) // Adjust the height as necessary
                        }
                    }
                    .padding()

                    // Add space below the stack for the last item
                    //  to be centered when it's selected
                    Spacer().frame(height: outerGeometry.size.height / 2)
                }
            }
        }

    // var body: some View {
    //     GeometryReader { geometry in
    //         ScrollViewReader { proxy in
    //             ScrollView {
    //                 LazyVStack {
    //                     ForEach(units, id: \.unitId) { unit in
    //                         HStack {
    //                             Text(unit.unitName)
    //                                 .font(.body)
    //                                 // .foregroundColor(.black)
                                
    //                             Spacer()
                                
    //                             // Image(systemName: unit.unitImageName)
    //                             Image(systemName: "checkmark")
    //                                 .resizable()
    //                                 .scaledToFit()
    //                                 .frame(width: 30, height: 30)
    //                         }
    //                         .frame(width: geometry.size.width - 32)
    //                         .padding()
    //                         .background(RoundedRectangle(cornerRadius: 10)
    //                                         .stroke(selectedUnit == unit ? AppColors.primaryColor : Color.gray)
    //                                         .background(selectedUnit == unit ? AppColors.primaryColor.opacity(0.1) : Color.clear)
    //                         )
    //                         .id(unit.unitId) // Add ID for ScrollViewReader
    //                         .onTapGesture {
    //                             selectedUnit = unit
    //                         }
    //                     }
    //                 }
    //                 .padding()
    //             }
    //             .onAppear {
    //                 // Scroll to the selected unit when the view appears
    //                 if let selectedUnit = selectedUnit {
    //                     proxy.scrollTo(selectedUnit.unitId, anchor: .center)
    //                 }
    //             }
    //         }
    //         // .padding()
    //         // .navigationBarTitle("", displayMode: .inline) // Hide the title text
    //     }
    // }
}

struct UnitSelectionView_Previews: PreviewProvider {
    static var previews: some View {
        UnitSelectionView()
    }
}