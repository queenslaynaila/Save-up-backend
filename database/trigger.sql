CREATE FUNCTION update_saving_status()
RETURNS TRIGGER AS $update_saving_status$
BEGIN
    IF NEW.contributed_amount >= NEW.target_amount THEN
        NEW.status := 'Complete';
    END IF;
    RETURN NEW;
END;

$update_saving_status$ LANGUAGE plpgsql;
CREATE TRIGGER update_saving_status_trigger
BEFORE INSERT OR UPDATE OF contributed_amount ON savings
FOR EACH ROW
EXECUTE FUNCTION update_saving_status();

