import Button from '@mui/material/Button';

interface ModifyButtonProps {
  onClick?: () => void;
}

/**
 * Generic Modify button component
 *
 * @component
 *
 * @param props: Object - The component props
 * @returns
 */
const ModifyButton = ({ onClick }: ModifyButtonProps) => {
  return (
    <Button
      variant='contained'
      onClick={onClick}
      sx={{
        bgcolor: '#9C844C',
        color: '#fff',
        textTransform: 'none',
        padding: '6px 30px',
        margin: '10px 0',
        '&:hover': {
          bgcolor: '#876F39',
          opacity: '0.8',
        },
      }}
    >
      Modify Task
    </Button>
  );
};

export default ModifyButton;
