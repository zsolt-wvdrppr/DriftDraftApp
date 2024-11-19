import WizardContainer from "../../components/questionnaire/WizardContainer";

export default function Start() {
  return (
    <section className="flex flex-col items-center justify-center gap-4">
      <WizardContainer position="top-right" />
    </section>
  );
}
