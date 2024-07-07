import SwiftUI

struct UnitSelectionView: View {
    @State private var selectedUnit: UnitModel? = UnitModel.getUnit(withName: "Other")
    let units = UnitModel.getUnits()

    var body: some View {
        GeometryReader { geometry in
            ScrollViewReader { proxy in
                ScrollView {
                    LazyVStack {
                        ForEach(units, id: \.unitId) { unit in
                            HStack {
                                Text(unit.unitName)
                                    .font(.body)
                                    // .foregroundColor(.black)
                                
                                Spacer()
                                
                                // Image(systemName: unit.unitImageName)
                                Image(systemName: "checkmark")
                                    .resizable()
                                    .scaledToFit()
                                    .frame(width: 30, height: 30)
                            }
                            .frame(width: geometry.size.width - 32)
                            .padding()
                            .background(RoundedRectangle(cornerRadius: 10)
                                            .stroke(selectedUnit == unit ? AppColors.primaryColor : Color.gray)
                                            .background(selectedUnit == unit ? AppColors.primaryColor.opacity(0.1) : Color.clear)
                            )
                            .id(unit.unitId) // Add ID for ScrollViewReader
                            .onTapGesture {
                                selectedUnit = unit
                            }
                        }
                    }
                    .padding()
                }
                .onAppear {
                    // Scroll to the selected unit when the view appears
                    if let selectedUnit = selectedUnit {
                        proxy.scrollTo(selectedUnit.unitId, anchor: .center)
                    }
                }
            }
            // .padding()
            // .navigationBarTitle("", displayMode: .inline) // Hide the title text
        }
    }
}

struct UnitSelectionView_Previews: PreviewProvider {
    static var previews: some View {
        UnitSelectionView()
    }
}