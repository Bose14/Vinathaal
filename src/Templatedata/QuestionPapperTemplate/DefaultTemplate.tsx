const DefaultTemplate = ({ editedConfig }) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return "Date: ___________";
    return `Date: ${new Date(dateString).toLocaleDateString()}`;
  };

  return (
    <div>
      <div className="header text-center mb-8">
        <h2 className="text-2xl font-bold">{editedConfig.university || "University Name"}</h2>
        <h3 className="text-lg font-semibold">{editedConfig.subjectName || "Subject Name"}</h3>
        <div className="flex justify-between border-b pb-2">
          <span>{formatDate(editedConfig.examDate)}</span>
          <span>Time: {editedConfig.duration || "Duration: ___"}</span>
          <span>Total Marks: {editedConfig.totalMarks}</span>
        </div>
      </div>

      {editedConfig.sections?.map((section: any, idx: number) => (
        <div key={section.id} className="mb-6">
          <h4 className="font-semibold mb-2">{section.name}</h4>
          {section.questions?.map((q: any, qIdx: number) => (
            <div key={q.id} className="mb-3">
              {qIdx + 1}. {q.text} [{q.marks} Marks]
              {q.subQuestions?.length > 0 && (
                <div className="ml-4 mt-1 space-y-1">
                  {q.subQuestions.map((subQ: any, subIdx: number) => (
                    <div key={subQ.id}>{String.fromCharCode(97 + subIdx)}. {subQ.text} [{subQ.marks} Marks]</div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ))}

      <div className="footer mt-12 pt-4 border-t border-slate-200 text-center">
        <p className="text-sm text-slate-500">
          Generated using AI Question Paper Generator • {editedConfig.university || "University"} Format
        </p>
      </div>
    </div>
  );
};

export default DefaultTemplate;
