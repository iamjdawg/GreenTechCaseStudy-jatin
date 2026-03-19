import { useState } from 'react'

export default function RecipeModal({ open, onClose, recipes, loading }) {
  const [activeTab, setActiveTab] = useState(0)
  const [exporting, setExporting] = useState(false)

  if (!open) return null

  const handleSavePDF = async () => {
    const recipe = recipes[activeTab]
    if (!recipe) return
    setExporting(true)
    try {
      const { jsPDF } = await import('jspdf')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const margin = 20
      const contentWidth = pageWidth - margin * 2
      let y = margin

      const checkPage = (needed = 10) => {
        if (y + needed > pageHeight - margin) {
          pdf.addPage()
          y = margin
        }
      }

      // Title
      pdf.setFontSize(20)
      pdf.setFont('helvetica', 'bold')
      const titleLines = pdf.splitTextToSize(recipe.title, contentWidth)
      checkPage(titleLines.length * 8)
      pdf.text(titleLines, margin, y)
      y += titleLines.length * 8 + 2

      // Description
      pdf.setFontSize(11)
      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(100, 100, 100)
      const descLines = pdf.splitTextToSize(recipe.description, contentWidth)
      checkPage(descLines.length * 5)
      pdf.text(descLines, margin, y)
      y += descLines.length * 5 + 2
      pdf.setTextColor(0, 0, 0)

      // Prep time & servings
      if (recipe.prep_time || recipe.servings) {
        pdf.setFontSize(10)
        pdf.setTextColor(120, 120, 120)
        const meta = [recipe.prep_time && `Prep: ${recipe.prep_time}`, recipe.servings && `Servings: ${recipe.servings}`].filter(Boolean).join('  |  ')
        checkPage(6)
        pdf.text(meta, margin, y)
        y += 8
        pdf.setTextColor(0, 0, 0)
      }

      // Divider
      y += 2
      pdf.setDrawColor(220, 220, 220)
      pdf.line(margin, y, pageWidth - margin, y)
      y += 8

      // Ingredients
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      checkPage(10)
      pdf.text('Ingredients', margin, y)
      y += 8

      pdf.setFontSize(11)
      pdf.setFont('helvetica', 'normal')
      for (const ing of (recipe.ingredients || [])) {
        checkPage(7)
        const label = `${ing.quantity} ${ing.name}`
        const suffix = ing.is_expiring ? '  [expiring]' : ''
        pdf.text(`\u2022  ${label}${suffix}`, margin + 2, y)
        y += 6
      }

      y += 6
      pdf.line(margin, y, pageWidth - margin, y)
      y += 8

      // Instructions
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      checkPage(10)
      pdf.text('Instructions', margin, y)
      y += 8

      pdf.setFontSize(11)
      pdf.setFont('helvetica', 'normal')
      for (let i = 0; i < (recipe.instructions || []).length; i++) {
        const stepLines = pdf.splitTextToSize(recipe.instructions[i], contentWidth - 12)
        checkPage(stepLines.length * 5 + 4)
        pdf.setFont('helvetica', 'bold')
        pdf.text(`${i + 1}.`, margin + 2, y)
        pdf.setFont('helvetica', 'normal')
        pdf.text(stepLines, margin + 12, y)
        y += stepLines.length * 5 + 4
      }

      pdf.save(`${recipe.title.replace(/\s+/g, '_')}.pdf`)
    } catch {
      // Silently fail
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Use It or Lose It Recipes</h2>
            <p className="text-xs text-gray-500">AI-generated recipes from your expiring items</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center py-16">
            <div className="text-center">
              <svg className="animate-spin h-8 w-8 text-leaf-600 mx-auto mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p className="text-sm text-gray-500">Generating recipes...</p>
            </div>
          </div>
        ) : !recipes || recipes.length === 0 ? (
          <div className="flex-1 flex items-center justify-center py-16">
            <p className="text-sm text-gray-400">No recipes generated</p>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex border-b border-gray-100 px-6">
              {recipes.map((recipe, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTab(i)}
                  className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === i
                      ? 'border-leaf-600 text-leaf-700'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Recipe {i + 1}
                </button>
              ))}
            </div>

            {/* Recipe content */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {recipes[activeTab] && <RecipeContent recipe={recipes[activeTab]} />}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={handleSavePDF}
                disabled={exporting}
                className="px-4 py-2 text-sm bg-leaf-600 text-white rounded-lg hover:bg-leaf-700 font-medium disabled:opacity-50"
              >
                {exporting ? 'Exporting...' : 'Save as PDF'}
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
              >
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function RecipeContent({ recipe }) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-bold text-gray-800">{recipe.title}</h3>
        <p className="text-sm text-gray-600 mt-1">{recipe.description}</p>
        <div className="flex gap-4 mt-2">
          {recipe.prep_time && (
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {recipe.prep_time}
            </span>
          )}
          {recipe.servings && (
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
              {recipe.servings}
            </span>
          )}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Ingredients</h4>
        <ul className="space-y-1.5">
          {recipe.ingredients?.map((ing, i) => (
            <li key={i} className={`text-sm flex items-center gap-2 px-2.5 py-1.5 rounded-md ${
              ing.is_expiring ? 'bg-amber-50 border border-amber-200' : 'bg-gray-50'
            }`}>
              <span className="text-gray-700">{ing.quantity} {ing.name}</span>
              {ing.is_expiring && (
                <span className="text-[10px] bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded-full font-medium">expiring</span>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Instructions</h4>
        <ol className="space-y-2">
          {recipe.instructions?.map((step, i) => (
            <li key={i} className="text-sm text-gray-700 flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-leaf-100 text-leaf-700 rounded-full flex items-center justify-center text-xs font-bold">{i + 1}</span>
              <span className="pt-0.5">{step}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
