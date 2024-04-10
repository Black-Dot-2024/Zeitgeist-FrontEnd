import Layout from "../../components/common/Layout";
import AddButton from "../../components/common/AddButton";
import CardsGrid from "../../components/common/CardsGrid";
import ClientCard from "../../components/common/ClientCard";


const clients = [
  {
      id: 1,
      name: "Acme Corporation",
      accountingHours: 20,
      legalHours: 15,
      chargeableHours: 10,
      totalProjects: 5,
  },
  {
      id: 2,
      name: "Wayne Enterprises",
      accountingHours: 22,
      legalHours: 18,
      chargeableHours: 12,
      totalProjects: 6,
  },
  {
      id: 3,
      name: "Stark Industries",
      accountingHours: 25,
      legalHours: 20,
      chargeableHours: 15,
      totalProjects: 7,
  },
  {
      id: 4,
      name: "LexCorp",
      accountingHours: 18,
      legalHours: 12,
      chargeableHours: 8,
      totalProjects: 4,
  },
  {
      id: 5,
      name: "Umbrella Corporation",
      accountingHours: 30,
      legalHours: 25,
      chargeableHours: 20,
      totalProjects: 10,
  },
  {
      id: 6,
      name: "Weyland-Yutani Corporation",
      accountingHours: 28,
      legalHours: 22,
      chargeableHours: 18,
      totalProjects: 8,
  },
  {
      id: 7,
      name: "Aperture Science",
      accountingHours: 35,
      legalHours: 30,
      chargeableHours: 25,
      totalProjects: 12,
  },
  {
      id: 8,
      name: "InGen",
      accountingHours: 15,
      legalHours: 10,
      chargeableHours: 5,
      totalProjects: 3,
  },
  {
      id: 9,
      name: "Tyrell Corporation",
      accountingHours: 32,
      legalHours: 27,
      chargeableHours: 22,
      totalProjects: 11,
  },
  {
      id: 10,
      name: "Wernham Hogg",
      accountingHours: 26,
      legalHours: 21,
      chargeableHours: 16,
      totalProjects: 9,
  },
];

const Clients = () => {
  return (
    <Layout>
      <main className="p-10 py-0 flex flex-col gap-4">
      <section className='flex flex-row justify-end p-5 gap-6'>
          <button>Not Archived</button>
          <AddButton/>
        </section>
        <CardsGrid>
          {clients.map((client) => (
            <ClientCard 
                name={client.name}
                accountingHours= {client.accountingHours}
                legalHours= {client.legalHours}
                chargeableHours= {client.chargeableHours}
                totalProjects= {client.totalProjects}
              />
          ))}
        </CardsGrid>
      </main>
    </Layout>
  );
};

export default Clients;
