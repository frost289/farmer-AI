import EmptyState from '../../components/common/EmptyState.jsx';
import FarmCard from './FarmCard.jsx';

export default function FarmList({ farms = [], emptyAction }) {
  if (!farms.length) {
    return <EmptyState title="No farms yet" message="Add your farm to get advice for your land." action={emptyAction} />;
  }
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {farms.map((farm) => (
        <FarmCard key={farm.id} farm={farm} />
      ))}
    </div>
  );
}
