import AccountContent from "@/components/account/account-content"
import AgentPanel from "@/components/agent-panel/Main";

const AccountPage = () => {
  return (
    <>
    <section className="">
        <AccountContent />
    </section>
    <section>
      <AgentPanel />
    </section>
    </>
  )
}

export default AccountPage