import React, { useState } from 'react';
import { Card, Checkbox, Button } from 'shadcn/ui';

interface ScrapedData {
  name: string;
  bio: string;
  photo: string;
  socialLinks: string[];
}

interface WebsiteDataApprovalProps {
  scrapedData: ScrapedData;
  onApprove: (selectedFields: string[]) => void;
  onCancel: () => void;
}

const WebsiteDataApproval: React.FC<WebsiteDataApprovalProps> = ({ scrapedData, onApprove, onCancel }) => {
  const [selectedFields, setSelectedFields] = useState<string[]>([]);

  const handleCheckboxChange = (field: string) => {
    setSelectedFields(prev => prev.includes(field) ? prev.filter(f => f !== field) : [...prev, field]);
  };

  const handleApprove = () => {
    onApprove(selectedFields);
  };

  return (
    <Card>
      <div data-testid="website-data-approval">
        <div>
          <h3>Name</h3>
          <div>{scrapedData.name}</div>
          <Checkbox checked={selectedFields.includes('name')} onChange={() => handleCheckboxChange('name')} data-testid="checkbox-name" />
        </div>
        <div>
          <h3>Bio</h3>
          <div>{scrapedData.bio}</div>
          <Checkbox checked={selectedFields.includes('bio')} onChange={() => handleCheckboxChange('bio')} data-testid="checkbox-bio" />
        </div>
        <div>
          <h3>Photo</h3>
          <div>{scrapedData.photo}</div>
          <Checkbox checked={selectedFields.includes('photo')} onChange={() => handleCheckboxChange('photo')} data-testid="checkbox-photo" />
        </div>
        <div>
          <h3>Social Links</h3>
          <div>{scrapedData.socialLinks.join(', ')}</div>
          <Checkbox checked={selectedFields.includes('socialLinks')} onChange={() => handleCheckboxChange('socialLinks')} data-testid="checkbox-social-links" />
        </div>
        <Button onClick={handleApprove} data-testid="import-selected">Import Selected</Button>
        <Button onClick={onCancel} data-testid="cancel">Cancel</Button>
      </div>
    </Card>
  );
};

export default WebsiteDataApproval;